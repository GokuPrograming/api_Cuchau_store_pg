<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const db = require('../database/connection')  // Importa tu conexión a la base de datos aquí
//const verificarToken = require('./verificaToken');  // Importa el middleware de verificación de token

router.get('/carrito', verificarToken, async (req, res) => {
    const { id_usuario } = req.usuario;  // Obtener id_usuario del token verificado

    try {
        const client = await db.connect();

        // Consulta SQL para obtener todos los productos en el carrito del usuario
        const result = await client.query('select * from carrito WHERE id_usuario = $1', [id_usuario]);

        const results = { 'data': (result) ? result.rows : null };
        res.json(results);

        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("inicia sesion" + err);
    }
});

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const db = require('../database/connection')  // Importa tu conexión a la base de datos aquí

const verificarToken = require('./verificaToken');


router.get('/carrito', verificarToken, async (req, res) => {
    const { id_usuario } = req.usuario;  // Obtener id_usuario del token verificado
    try {
        const client = await db.connect();

        // Consulta SQL para obtener todos los productos en el carrito del usuario
        const result = await client.query('select * from carrito WHERE id_usuario = $1', [id_usuario]);

        const results = { 'data': (result) ? result.rows : null };
        res.json(results);

        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("inicia sesion" + err);
    }
});


module.exports = router;
>>>>>>> fcaffa2ab540678498f91c844122c1d255cfb4f6
