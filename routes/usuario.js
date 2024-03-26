const express = require('express')
const db = require('../database/connection')
const router = express.Router()


router.get('/usuario', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('select * from usuario');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
router.get('/usuario/:id', async (req, res) => {
    const id_usuario = req.params.id;  // Obtener el id_usuario desde los parámetros de la URL

    try {
        const client = await db.connect();

        // Consulta SQL modificada para filtrar por id_usuario
        const result = await client.query('SELECT * FROM usuario WHERE id_usuario = $1', [id_usuario]);

        const results = { 'data': (result) ? result.rows : null };
        res.json(results);

        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
module.exports = router;