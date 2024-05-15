const express = require('express')
const jwt = require('jsonwebtoken');  // Importa jsonwebtoken
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

router.post('/usuario/login', async (req, res) => {
    const { correo, password } = req.body;  // Obtener correo y password desde el cuerpo de la solicitud

    try {
        const client = await db.connect();

        // Consulta SQL para verificar las credenciales del usuario
        const result = await client.query('SELECT * FROM usuario WHERE correo = $1 AND password = $2', [correo, password]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Generar un token JWT
            const token = jwt.sign({ id_usuario: user.id_usuario, correo: user.correo }, 'secreto', { expiresIn: '1h' });  // 'secreto' debe ser una cadena segura en la vida real

            res.json({ 'message': 'Inicio de sesión exitoso', 'token': token });
        } else {
            res.status(401).json({ 'message': 'Correo o contraseña incorrectos' });
        }

        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error " + err);
    }
});


module.exports = router;