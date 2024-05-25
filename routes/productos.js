const express = require('express')
const db = require('../database/connection')
const prisma = require('../database/conn')
const router = express.Router()


// router.get('/producto', async (req, res) => {
//     const productS = await prisma.producto.findMany();
//     res.json(productS);
// });

router.post('/product', async (req, res) => {
    const newProduct = await prisma.producto.create({
        data: req.body,
    });
    res.json(newProduct);
});

router.put('/product/:id', async (req, res) => {
    const id = req.params.id;

    const { producto, precio, almacen, id_proveedor, id_categoria, imagen } = req.body; // Corrección aquí

    const updateProducto = await prisma.producto.update({
        where: {
            id_producto: parseInt(id),
        },
        data: {
            producto,
            precio,
            almacen,
            id_proveedor,
            id_categoria,
            imagen
        },
    });
    res.json(updateProducto);
});

router.delete('/product/:id', async (req, res) => {
    const id = req.params.id;

    const deleteProducto = await prisma.producto.delete({
        where: {
            id_producto: parseInt(id),
        },
    });
    res.json(deleteProducto);
});


module.exports = router;