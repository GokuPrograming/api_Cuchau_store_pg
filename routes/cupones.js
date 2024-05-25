const express = require('express')
const prisma = require('../database/conn')
const router = express.Router()


router.get('/cupon', async (req, res) => {
    const cuponesDisponibles = await prisma.cupon_disponible.findMany();
    res.json(cuponesDisponibles);
});

router.post('/cupon', async (req, res) => {
    const newCupon = await prisma.cupon_disponible.create({
        data: req.body,
    });
    res.json(newCupon);
});

router.put('/cupon/:id', async (req, res) => {
    const id = req.params.id;

    const { codigo, porcentaje_descuento, fecha_inicio, fecha_fin, cantidad } = req.body; // Corrección aquí

    const updateCupon = await prisma.cupon_disponible.update({
        where: {
            id_cupon_d: parseInt(id),
        },
        data: {
            codigo,
            porcentaje_descuento,
            fecha_inicio,
            fecha_fin,
            cantidad
        },
    });
    res.json(updateCupon);
});

router.delete('/cupon/:id', async (req, res) => {
    const id = req.params.id;

    const deleteCupon = await prisma.cupon_disponible.delete({
        where: {
            id_cupon_d: parseInt(id),
        },
    });
    res.json(deleteCupon);
});

router.post('/usarCupon', async (req, res) => {
    const { id_venta, id_cupon_d, id_usuario, fecha_usado } = req.body;
    const cantCupones = await prisma.cupon_disponible.findMany({
        where: {
            id_cupon_d: parseInt(id_cupon_d)
        },
    });
    if (cantCupones.length > 0) {
        // console.log('CANTIDAD: ' + cantCupones[0].cantidad);
        if (cantCupones[0].cantidad > 0) {
            /**ACTUALIZACION DE LA CANTIDAD DEL CUPON DISPONIBLE */
            const newcantidad = parseInt(cantCupones[0].cantidad) - 1;

            const updateCupon = await prisma.cupon_disponible.update({
                where: {
                    id_cupon_d: parseInt(id_cupon_d),
                },
                data: {
                    codigo: cantCupones[0].codigo,
                    porcentaje_descuento: cantCupones[0].porcentaje_descuento,
                    fecha_inicio: cantCupones[0].fecha_inicio,
                    fecha_fin: cantCupones[0].fecha_fin,
                    cantidad: newcantidad
                },
            });
            /** ----------------------------------------------- */

            if (updateCupon) {
                const cuponVenta = await prisma.venta.update({
                    where: {
                        id_venta: parseInt(id_venta),
                    },
                    data: {
                        cupon: cantCupones[0].codigo
                    },
                })
                const newCuponUsado = await prisma.cupon_usado.create({
                    data: {
                        id_cupon_d: id_cupon_d,
                        id_usuario: id_usuario,
                        fecha_usado: fecha_usado
                    },
                });
                res.json(newCuponUsado);
            } else {
                res.json({ "error": "No se pudo reducir el stock del cupon" });
            }
        } else {
            res.json({ "error": "Sin stock" });
        }
    } else {
        res.json({ "error": "El cupon no existe" });
    }
});


module.exports = router;