const express = require('express')
const { engine } = require('express-handlebars')
const path = require('path')
const session = require('express-session')
require('dotenv').config()

const app = express()

app.engine('hbs', engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'novadrive_secret',
    resave: false,
    saveUninitialized: false
}))

const vehiculosRoutes = require('./routes/vehiculos')
const authRoutes = require('./routes/auth')
app.use('/', vehiculosRoutes)
app.use('/', authRoutes)

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000')
})