const express = require('express')
const router = express.Router()
const db = require('../db/connection')
const PDFDocument = require('pdfkit')

function requireLogin(req, res, next) {
    if (!req.session.usuario) return res.redirect('/login')
    next()
}

router.get('/', requireLogin, (req, res) => {
    res.render('home')
})

router.get('/catalogo', requireLogin, (req, res) => {
    db.query('SELECT * FROM vehiculo', (err, resultado) => {
        if (err) throw err
        const vehiculos = resultado.map(v => ({
            ...v,
            esDisponible:    v.estado === 'disponible',
            estaEnUso:       v.estado === 'en_uso',
            enMantenimiento: v.estado === 'mantenimiento'
        }))
        res.render('Catalogo', { vehiculos })
    })
})

router.post('/contrato/confirmar', requireLogin, (req, res) => {
    const { id_vehiculo, precio_dia, nombre, cedula, telefono, direccion, fecha_inicio, fecha_fin } = req.body

    const inicio = new Date(fecha_inicio)
    const fin = new Date(fecha_fin)
    const cantidad_dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))
    const monto_total = cantidad_dias * parseFloat(precio_dia)
    const fecha_registro = new Date().toISOString().split('T')[0]
    const fecha_emision = fecha_registro

    db.beginTransaction((err) => {
        if (err) return res.send('Error al iniciar la operación: ' + err.message)

        db.query('SELECT estado FROM vehiculo WHERE id_vehiculo = ? FOR UPDATE', [id_vehiculo], (err, rows) => {
            if (err) return db.rollback(() => res.send('Error verificando disponibilidad: ' + err.message))
            if (!rows[0] || rows[0].estado !== 'disponible') {
                return db.rollback(() => res.send('Este vehículo ya no está disponible.'))
            }

                db.query('SELECT * FROM cliente WHERE id_usuario = ? OR cedula = ?', [req.session.usuario.id, cedula], (err, clienteExistente) => {                if (err) return db.rollback(() => res.send('Error verificando cliente: ' + err.message))

                if (clienteExistente.length > 0) {
                    continuarConContrato(clienteExistente[0].id_cliente)
                } else {
                    db.query('INSERT INTO cliente (id_usuario, nombre, cedula, telefono, direccion, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?, "activo")',
                    [req.session.usuario.id, nombre, cedula, telefono, direccion, fecha_registro], (err, resultCliente) => {
                        if (err) return db.rollback(() => res.send('Error insertando cliente: ' + err.message))
                        continuarConContrato(resultCliente.insertId)
                    })
                }

                function continuarConContrato(id_cliente) {
                    db.query('INSERT INTO contrato (id_cliente, id_vehiculo, id_empleado, cantidad_dias, precio_dia, monto_total, fecha_inicio, fecha_fin, estado) VALUES (?, ?, 1, ?, ?, ?, ?, ?, "activo")',
                    [id_cliente, id_vehiculo, cantidad_dias, precio_dia, monto_total, fecha_inicio, fecha_fin], (err, resultContrato) => {
                        if (err) return db.rollback(() => res.send('Error insertando contrato: ' + err.message))

                        const id_contrato = resultContrato.insertId

                        db.query('INSERT INTO factura (id_contrato, monto_total, fecha_emision, estado_pago) VALUES (?, ?, ?, "pagado")',
                        [id_contrato, monto_total, fecha_emision], (err, resultFactura) => {
                            if (err) return db.rollback(() => res.send('Error insertando factura: ' + err.message))

                            const id_factura = resultFactura.insertId

                            db.query('INSERT INTO pago (id_factura, id_metodo_pago, monto, fecha_pago) VALUES (?, 2, ?, NOW())',
                            [id_factura, monto_total], (err) => {
                                if (err) return db.rollback(() => res.send('Error insertando pago: ' + err.message))

                                db.commit((err) => {
                                    if (err) return db.rollback(() => res.send('Error confirmando operación: ' + err.message))

                                    db.query(`SELECT c.*, v.marca, v.modelo, v.anio, v.color, cl.nombre, cl.cedula, cl.telefono, cl.direccion
                                              FROM contrato c
                                              JOIN vehiculo v ON c.id_vehiculo = v.id_vehiculo
                                              JOIN cliente cl ON c.id_cliente = cl.id_cliente
                                              WHERE c.id_contrato = ?`, [id_contrato], (err, datos) => {
                                        if (err) return res.send('Error generando PDF: ' + err.message)

                                        const d = datos[0]
                                        const doc = new PDFDocument({ margin: 50 })

                                        res.setHeader('Content-Type', 'application/pdf')
                                        res.setHeader('Content-Disposition', `attachment; filename=contrato_${id_contrato}.pdf`)
                                        doc.pipe(res)

                                        doc.fontSize(22).font('Helvetica-Bold').text('NOVADRIVE', { align: 'center' })
                                        doc.fontSize(12).font('Helvetica').text('Contrato y Factura de Alquiler', { align: 'center' })
                                        doc.moveDown()
                                        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
                                        doc.moveDown()

                                        doc.fontSize(14).font('Helvetica-Bold').text('Datos del Contrato')
                                        doc.fontSize(11).font('Helvetica')
                                        doc.text(`N° Contrato: ${id_contrato}`)
                                        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-DO')}`)
                                        doc.text(`Fecha inicio: ${d.fecha_inicio}`)
                                        doc.text(`Fecha fin: ${d.fecha_fin}`)
                                        doc.text(`Días rentados: ${d.cantidad_dias}`)
                                        doc.moveDown()

                                        doc.fontSize(14).font('Helvetica-Bold').text('Vehículo')
                                        doc.fontSize(11).font('Helvetica')
                                        doc.text(`${d.marca} ${d.modelo} ${d.anio}`)
                                        doc.text(`Color: ${d.color}`)
                                        doc.text(`Precio por día: RD$ ${d.precio_dia}`)
                                        doc.moveDown()

                                        doc.fontSize(14).font('Helvetica-Bold').text('Cliente')
                                        doc.fontSize(11).font('Helvetica')
                                        doc.text(`Nombre: ${d.nombre}`)
                                        doc.text(`Cédula: ${d.cedula}`)
                                        doc.text(`Teléfono: ${d.telefono}`)
                                        doc.text(`Dirección: ${d.direccion}`)
                                        doc.moveDown()

                                        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
                                        doc.moveDown()

                                        doc.fontSize(14).font('Helvetica-Bold').text('Factura')
                                        doc.fontSize(11).font('Helvetica')
                                        doc.text(`N° Factura: ${id_factura}`)
                                        doc.text(`Monto total: RD$ ${monto_total}`)
                                        doc.text(`Estado: PAGADO`)
                                        doc.text(`Método de pago: Tarjeta`)
                                        doc.moveDown()

                                        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
                                        doc.moveDown()
                                        doc.fontSize(10).fillColor('gray').text('NovaDrive by LD — Documento generado automáticamente', { align: 'center' })

                                        doc.end()
                                    })
                                })
                            })
                        })
                    })
                }
            })
        })
    })
})

router.get('/contrato/:id', requireLogin, (req, res) => {
    const id = req.params.id
    db.query('SELECT * FROM vehiculo WHERE id_vehiculo = ?', [id], (err, resultado) => {
        if (err) throw err
        res.render('contrato', { vehiculo: resultado[0] })
    })
})

module.exports = router