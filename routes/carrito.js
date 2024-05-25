const express = require('express');
const router = express.Router();
const db = require('../database/connection')  // Importa tu conexión a la base de datos aquí
const prisma = require('../database/conn')


const verificarToken = require('./verificaToken');

router.get('/carrito', async (req, res) => {
    try {
        const id_usuario = req.body.usuario;

        let carritos;

        if (id_usuario) {
            carritos = await prisma.carrito.findMany({
                where: {
                    id_usuario: parseInt(id_usuario),
                },
            });
        } else {
            carritos = await prisma.carrito.findMany();
        }


        res.json(carritos);

    } catch (error) {
        console.error(error);
        res.status(500).send("inicia sesion" + error);
    }
});

router.post('/carrito', async (req, res) => {
    const newCarrito = await prisma.carrito.create({
        data: req.body,
    });
    res.json(newCarrito);
});


module.exports = router;