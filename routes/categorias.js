const express = require('express')
const prisma = require('../database/conn')
const router = express.Router()


router.get('/category', async (req, res) => {
    const categories = await prisma.categoria.findMany();
    res.json(categories);
});

router.post('/category', async (req, res) => {
    const newCategory = await prisma.categoria.create({
        data: req.body,
    });
    res.json(newCategory);
});

router.put('/category/:id', async (req, res) => {
    const id = req.params.id;

    const { categoria, descripcion } = req.body; // Corrección aquí

    const updateCatgoria = await prisma.carrito.update({
        where: {
            id_categoria: parseInt(id),
        },
        data: {
            categoria,
            descripcion
        },
    });
    res.json(updateCatgoria);
});

router.delete('/category/:id', async (req, res) => {
    const id = req.params.id;

    const deleteCategoria = await prisma.categoria.delete({
        where: {
            id_categoria: parseInt(id),
        },
    });
    res.json(deleteCategoria);
});

module.exports = router;