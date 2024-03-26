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
app.listen(port, async () => console.log(`Example app listening on port ${port}!`))