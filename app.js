const express = require('express')
const cors = require('cors');
const app = express()
const port = 3000
// Habilitar CORS para todos los dominios
app.use(cors());
//exportar rutas
const rol = require('./routes/rol')
const user = require('./routes/usuario')
const carrito = require('./routes/carrito')

// express json

app.use(express.json())
//uso de las rutas
app.use('/', rol, user, carrito)
app.listen(port, async () => console.log(`Example app listening on port ${port}!`))