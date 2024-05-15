<<<<<<< HEAD
const express = require('express')

const port = 3000

//exportar rutas
const rol = require('./routes/rol')
const user = require('./routes/usuario')

// express json
const app = express()
app.use(express.json())
//uso de las rutas
app.use('/', rol, user)
=======
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
>>>>>>> fcaffa2ab540678498f91c844122c1d255cfb4f6
app.listen(port, async () => console.log(`Example app listening on port ${port}!`))