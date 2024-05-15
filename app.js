
const express = require('express')
const cors = require('cors');

const app = express();
const port = 3000;
// Habilitar CORS para todos los dominios
app.use(cors());
//exportar rutas
const rol = require('./routes/rol')
const user = require('./routes/usuario')
const carrito = require('./routes/carrito')
const producto = require('./routes/productos')
const ecomers = require('./routes/e_commers')

// express json

app.use(express.json())
//uso de las rutas
// app.use('/',verificar, rol, user, carrito, producto, ecomers)
app.use('/', rol, user, carrito, producto, ecomers)
app.listen(port, async () => console.log(`Example app listening on port ${port}!`))