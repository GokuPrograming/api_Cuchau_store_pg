
const express = require('express')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');  // Importa jsonwebtoken
const db = require('../database/connection')
const router = express.Router()
const verificarToken = require('./verificaToken');
///innicio de sesion


router.post('/usuario/login', async (req, res) => {
    const { correo, password } = req.body; // Obtener correo y password desde el cuerpo de la solicitud

    try {
        // Encriptación de la contraseña (se recomienda usar un algoritmo más seguro)
        const password_encriptada = crypto.createHash('md5').update(password).digest('hex');

        const client = await db.connect();
        const result = await client.query('SELECT * FROM usuario WHERE correo = $1 AND password = $2', [correo, password_encriptada]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id_usuario: user.id_usuario, correo: user.correo }, 'secreto'); // Reemplazar 'secreto' con una cadena segura

            // Imprimir la contraseña encriptada en la consola
            console.log(password_encriptada);

            // Opcional: Insertar en la tabla de sesión

            res.json({ 'message': 'Inicio de sesión exitoso', 'token': token, user });
        } else {
            res.status(401).json({ 'message': 'Correo o contraseña incorrectos' });
            console.log(password_encriptada);
        }

        client.release();
    } catch (err) {
        console.error(err);
        // Mejorar el manejo de errores para proporcionar información específica al usuario
        res.status(500).send("Error: " + err.message);
    }
});
router.post('/usuario/registro', async (req, res) => {
    const { correo, password, nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento } = req.body;
    const id_rol = 2;
    const password_encriptada = crypto.createHash('md5').update(password).digest('hex');
    // Fecha actual en formato ISO (UTC)
    const fecha_registro = new Date().toISOString();
    //conecta a la base de datos
    const client = await db.connect();
    try {
        //inicio de la transaccion
        await client.query('BEGIN');
        //insertar a tabla usuario
        const inserta_Usuario = await client.query(
            'INSERT INTO usuario(correo, password, id_rol, fecha_registro) VALUES($1, $2, $3, $4)',
            [correo, password_encriptada, id_rol, fecha_registro]
        );
        //obtener el ultimo id de la tabla de usuario
        const last_id = await client.query('SELECT * FROM usuario ORDER BY id_usuario DESC LIMIT 1');
        const user = last_id.rows[0];
        id_usuario = user.id_usuario;
        //insertar a la tabla cliente el ultimo usuario registrado
        await client.query(
            'INSERT INTO cliente(nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento, id_usuario) VALUES($1, $2, $3, $4, $5, $6)',
            [nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento, id_usuario]
        );
        // Confirmar transacción
        await client.query('COMMIT');
        console.log('Registro exitoso', correo, password_encriptada, nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento, id_rol, fecha_registro);
        //envia los datos
        res.json({
            correo, password_encriptada, nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento
        });
    } catch (err) {
        // Revertir transacción en caso de error
        await client.query('ROLLBACK');
        console.error('Error al registrar usuario:', err);
        res.status(500).json({
            message: 'Error al registrar usuario'
        });
    } finally {
        // Liberar el cliente de la conexión a la base de datos
        client.release();
    }


});



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








module.exports = router;
/*
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



*/


