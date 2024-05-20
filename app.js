const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;

// Habilitar CORS para todos los dominios
app.use(cors());

//exportar rutas
const rol = require('./routes/rol');
const user = require('./routes/usuario');
const carrito = require('./routes/carrito');
const producto = require('./routes/productos');
const ecomers = require('./routes/e_commers');
const categorias = require('./routes/categorias');
const cupones = require('./routes/cupones')

// express.json() reemplaza a bodyParser.json()
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//uso de las rutas
// app.use('/',verificar, rol, user, carrito, producto, ecomers)
app.use('/', rol, user, carrito, producto, ecomers, categorias, cupones);

app.listen(port, async () => console.log(`Example app listening on port ${port}!`));
