const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql2');


require('dotenv').config();

const app = express();
const port = process.env.port || 5000;


app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use(express.static('public'));


app.engine('hbs', exphbs( {extname: '.hbs'}));
app.set('view engine', 'hbs');

app.get('', (req, res) => {
    res.render('VehiculoCard')
});



app.listen(port, () => console.log(`escuchando en el port ${port}`));