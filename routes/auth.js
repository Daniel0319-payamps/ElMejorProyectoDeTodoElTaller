const express = require('express')
const router = express.Router()
const db = require('../db/connection')

router.get('/login', (req, res) => {
    if (req.session.usuario) return res.redirect('/catalogo')
    res.render('login', { layout: 'empty' })
})

router.post('/login', (req, res) => {
    const { correo, contrasena } = req.body

    db.query('SELECT * FROM usuario WHERE correo = ? AND contrasena = ? AND estado = "activo"',
    [correo, contrasena], (err, resultado) => {
        if (err) throw err

        if (resultado.length === 0) {
            return res.render('login', { layout: 'empty', error: 'Correo o contraseña incorrectos' })
        }

        req.session.usuario = {
            id: resultado[0].id_usuario,
            correo: resultado[0].correo,
            tipo: resultado[0].tipo_usuario
        }

        res.redirect('/')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

router.get('/registro', (req, res) => {
    if (req.session.usuario) return res.redirect('/')
    res.render('registro', { layout: 'empty' })
})

router.post('/registro', (req, res) => {
    const { correo, contrasena } = req.body

    db.query('SELECT * FROM usuario WHERE correo = ?', [correo], (err, resultado) => {
        if (err) throw err

        if (resultado.length > 0) {
            return res.render('registro', { layout: 'empty', error: 'Ese correo ya está registrado' })
        }

        db.query('INSERT INTO usuario (correo, contrasena, tipo_usuario, estado) VALUES (?, ?, "cliente", "activo")',
        [correo, contrasena], (err) => {
            if (err) throw err
            res.redirect('/login')
        })
    })
})

module.exports = router