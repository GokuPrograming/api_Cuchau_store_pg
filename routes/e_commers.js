const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const password_encriptada = crypto.createHash('md5').update(password).digest('hex');
        const client = await db.connect();
        const result = await client.query('SELECT * FROM usuario WHERE correo = $1 AND password = $2', [correo, password_encriptada]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id_usuario: user.id_usuario, correo: user.correo }, process.env.JWT_SECRET || 'secreto');

            res.json({ message: 'Inicio de sesión exitoso', token, user });
        } else {
            res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
    }
});

router.post('/addToCar', async (req, res) => {
    const { id_producto, id_usuario } = req.body;

    console.log("Producto y Usuario:", id_producto, id_usuario);

    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del header
        console.log('Token recibido:', token);  // Agregar este console log

        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secreto'); // Verifica y decodifica el token
        console.log('Token decodificado:', decodedToken);  // Agregar este console log

        if (!decodedToken || Number(decodedToken.id_usuario) !== Number(id_usuario)) {
            throw new Error('Token inválido');
        }

        const client = await db.connect();
        const result = await client.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad, subtotal, fecha_insertado) VALUES ($1, $2, 1, (SELECT precio FROM producto WHERE id_producto = $2), NOW()) RETURNING *',
            [id_usuario, id_producto]
        );

        console.log('Producto insertado:', result.rows[0]);  // Agregar este console log

        client.release();
        res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    }
});

module.exports = router;
