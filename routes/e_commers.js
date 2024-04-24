const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk')
let clientId = 'ATsXThlRKQMIDRsC0xX-EWt57Vg_FkznXcQNTrWdHgT-X2337ZiEuWGnnOgtubRXGfMJICcIOZ_lZ6aY';
let clientSecret = 'EPBsfImy1LBYQvyB02m-IsTvBIoZCudBOcRWGQhU2WkulbW1FwL6jJ0mpWEPbC7167A58-WFs42OXyHX';

//paypal
//paypal
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

router.post('/api/create-order', async (req, res) => {
    const { amount } = req.body;
  
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN', // Ensure MXN for pesos
          value: amount,
        },
      }],
    });
  
    try {
      const response = await client.execute(request);
      res.status(200).json({ orderID: response.result.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el pedido' });
    }
  });
router.post('/api/capture-order', async (req, res) => {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);

    try {
        const response = await client.execute(request);
        const captureId = response.result.purchase_units[0].payments.captures[0].id;
        res.status(200).json({ captureId: captureId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al capturar el pago' });
    }
});



router.get('/pais', async (req, res) => {
    let client;
    try {
        client = await db.connect();
        const result = await client.query('SELECT * FROM countries');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
    } catch (error) {
        console.error("Error al obtener los países:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    } finally {
        if (client) {
            client.release();
        }
    }
});
router.get('/estados/:id', async (req, res) => {
    const { id } = req.params; // Obtener el ID desde los parámetros de ruta
    let client;
    try {
        client = await db.connect();
        const result = await client.query('SELECT s.id, s.name FROM states s JOIN countries c ON s.id_country = c.id WHERE c.id = $1', [id]);
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
    } catch (error) {
        console.error("Error al obtener los países:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const password_encriptada = crypto.createHash('md5').update(password).digest('hex');
        const client = await db.connect();
        const result = await client.query('SELECT id_usuario,id_rol,correo,password FROM usuario WHERE correo = $1 AND password = $2', [correo, password_encriptada]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign({ id_usuario: user.id_usuario, correo: user.correo, id_rol: user.id_rol }, process.env.JWT_SECRET || 'secreto');

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

// router.post('/addToCar', async (req, res) => {
//     const { id_producto, id_usuario } = req.body;

//     console.log("Producto y Usuario:", id_producto, id_usuario);

//     try {
//         const token = req.headers.authorization?.split(' ')[1]; // Extrae el token del header
//         console.log('Token recibido:', token);  // Agregar este console log

//         if (!token) {
//             return res.status(401).json({ message: 'No autorizado' });
//         }

//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secreto'); // Verifica y decodifica el token
//         console.log('Token decodificado:', decodedToken);  // Agregar este console log

//         if (!decodedToken || Number(decodedToken.id_usuario) !== Number(id_usuario)) {
//             throw new Error('Token inválido');
//         }

//         const client = await db.connect();
//         const result = await client.query(
//             'INSERT INTO carrito (id_usuario, id_producto, cantidad, subtotal, fecha_insertado) VALUES ($1, $2, 1, (SELECT precio FROM producto WHERE id_producto = $2), NOW()) RETURNING *',
//             [id_usuario, id_producto]
//         );

//         console.log('Producto insertado:', result.rows[0]);  // Agregar este console log

//         client.release();
//         res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Error al agregar el producto al carrito' });
//     }
// });
const validarToken = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        // Extrae el token del header
        console.log('Token recibido:', token);  // Agregar este console log
        if (!token) {
            return res.status(401).json({ message: 'No autorizado' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secreto'); // Verifica y decodifica el token
        console.log('Token decodificado:', decodedToken);  // Agregar este console log
        const { id_usuario } = decodedToken; // Extrae el id_usuario del token decodificado
        if (!decodedToken || Number(decodedToken.id_usuario) !== Number(id_usuario)) {
            throw new Error('Token inválido');
        }
        return { id_usuario }; // Retorna el id_usuario si el token es válido
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return res.status(401).json({ message: 'No autorizado: Token inválido' });
    }
};

// router.post('/addToCar', async (req, res) => {
//     const { id_producto, id_usuario, cantidad } = req.body;
//     console.log("Producto y Usuario:", id_producto, id_usuario, "cantidad", cantidad);

//     // Validar el token
//     const resultadoValidacion = validarToken(req, res);
//     if (!resultadoValidacion.id_usuario) {
//         return;
//     }

//     let client;
//     try {
//         client = await db.connect();
//         // Obtener el stock del producto
//         const almacen_row = await client.query('SELECT * FROM producto WHERE id_producto=$1', [id_producto]);
//         // const stock = almacen_row.rows[0].almacen;
//         // console.log("en almacen =", stock);
//         let stock = 1;
//         // Verificar si hay suficiente stock
//         try {
//             if (cantidad > stock) {
//                 console.error("no hay suficiente stock");
//                 console.error(error.message);
//                 res.status(400).json({ message: 'No tenemos ya de esos productos :_' });

//             } else {
//                 await client.query('BEGIN');
//                 // Buscar el precio del artículo
//                 const { rows } = await client.query('SELECT precio FROM producto WHERE id_producto = $1', [id_producto]);
//                 const subtotal = rows[0].precio * cantidad;

//                 // Insertar el producto en el carrito
//                 const result = await client.query(
//                     'INSERT INTO carrito (id_usuario, id_producto, cantidad, subtotal, fecha_insertado) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
//                     [id_usuario, id_producto, cantidad, subtotal]
//                 );
//                 await client.query(
//                     'update producto set almacen=almacen-$1 where id_producto=$2', [cantidad, id_producto]
//                 );

//                 await client.query('COMMIT');
//                 console.log('Producto insertado:', result.rows[0]);
//                 res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
//             }
//         } catch (error) {
//             console.error(error.message);

//             if (client) {
//                 await client.query('ROLLBACK'); // Si ocurre un error, realizar un rollback
//                 client.release();
//             }

//             res.status(500).json({ message: 'Error al agregar el producto al carrito' });
//         } finally {
//             if (client) {
//                 client.release();
//             }
//         }
//     } catch { }

// });

router.post('/addToCar', async (req, res) => {
    const { id_producto, id_usuario, cantidad } = req.body;
    console.log("Producto y Usuario:", id_producto, id_usuario, "cantidad", cantidad);

    // Validar el token
    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return;
    }

    let client;
    try {
        client = await db.connect();

        // Obtener el stock del producto
        const almacen_row = await client.query('SELECT * FROM producto WHERE id_producto=$1', [id_producto]);
        let stock = almacen_row.rows[0].almacen;

        // Verificar si hay suficiente stock
        if (cantidad > stock) {
            console.error("no hay suficiente stock");
            res.status(400).json({ message: 'No tenemos ya de esos productos :_' });
            return;  // Agrega este return para salir de la función después de enviar la respuesta
        }

        await client.query('BEGIN');
        // Buscar el precio del artículo
        const { rows } = await client.query('SELECT precio FROM producto WHERE id_producto = $1', [id_producto]);
        const subtotal = rows[0].precio * cantidad;

        // Insertar el producto en el carrito
        const result = await client.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad, subtotal, fecha_insertado) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [id_usuario, id_producto, cantidad, subtotal]
        );
        await client.query(
            'update producto set almacen=almacen-$1 where id_producto=$2', [cantidad, id_producto]
        );

        await client.query('COMMIT');
        console.log('Producto insertado:', result.rows[0]);
        res.status(200).json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
        console.error(error.message);

        if (client) {
            await client.query('ROLLBACK'); // Si ocurre un error, realizar un rollback
            client.release();
        }

        res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    } finally {
        if (client) {
            client.release();
        }
    }
});



router.post('/user/car', async (req, res) => {
    const { id_usuario } = req.body;
    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return;
    }
    try {
        const client = await db.connect();
        const result = await client.query(
            'select p.producto,c.id_producto, c.id_usuario, sum(cantidad) as cantidad, sum(subtotal) as sub_total from carrito c inner join producto p on c.id_producto = p.id_producto where c.id_usuario=$1 group by c.id_producto, c.id_usuario,p.producto order by id_producto', [id_usuario]);
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' }); // Cambia el mensaje de error
    }
});
router.post('/user/car/total', async (req, res) => {
    const { id_usuario } = req.body;
    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return;
    }
    try {
        const client = await db.connect();
        const result = await client.query(
            'select sum(subtotal) as total from carrito where id_usuario=$1', [id_usuario]);
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' }); // Cambia el mensaje de error
    }
});
router.delete('/user/car/Delete_element', async (req, res) => {
    const { id_usuario, id_producto } = req.body;
    const resultadoValidacion = validarToken(req, res);
    // Verifica si la validación fue exitosa y si el id_usuario coincide
    if (!resultadoValidacion || resultadoValidacion.id_usuario !== id_usuario) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }
    try {
        const client = await db.connect();
        const result = await client.query(
            'DELETE FROM carrito WHERE id_usuario = $1 AND id_producto = $2',
            [id_usuario, id_producto]
        );
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
router.post('/perfil_usuario', async (req, res) => {
    const { id_usuario } = req.body;
    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return;
    }
    try {
        const client = await db.connect();
        const result = await client.query(
            `select correo, password, fecha_registro, fecha_nacimiento, nombre, apellido_paterno, apellido_materno, telefono from usuario u
            join public.cliente c on u.id_usuario = c.id_usuario
            where u.id_usuario = $1`, [id_usuario]);
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' }); // Cambia el mensaje de error
    };
})


router.post('/user/cupon', async (req, res) => {
    const { id_usuario, codigo } = req.body;
    console.log('usuario recibido:', id_usuario, 'codigo:', codigo);

    // Validar el token
    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return res.status(401).json({ message: 'Token no válido' });
    }

    let client;
    try {
        client = await db.connect();
        // Buscar el cupón en la base de datos
        const cupon = await client.query(
            'SELECT id_cupon_d, porcentaje_descuento, codigo FROM cupon_disponible WHERE codigo=$1 AND now() BETWEEN fecha_inicio AND fecha_fin AND cantidad > 0',
            [codigo]
        );
        if (cupon.rows.length > 0) {
            const id_cupon = cupon.rows[0].id_cupon_d;
            const codigoCupon = cupon.rows[0].codigo;
            const porcentaje_descuento = cupon.rows[0].porcentaje_descuento;

            console.log("cupon:", id_cupon, "codigo:", codigoCupon, "descuento", porcentaje_descuento);

            // Responder con el cupón válido
            // res.status(200).json({ id_cupon, codigo: codigoCupon });

            await client.query('BEGIN');

            // Verificar si el cupón ya fue usado por el usuario
            const cuponesUsados = await client.query(
                'SELECT id_cupon_d, id_usuario FROM cupon_usado WHERE id_cupon_d=$1 AND id_usuario=$2',
                [id_cupon, id_usuario]
            );

            if (cuponesUsados.rows.length > 0) {
                console.log("Este cupón ya se usó");
                res.status(200).json({ message: "este cupon ya fue utilizado" });

            } else {
                // Calcular el descuento y el nuevo total
                const total = await client.query(
                    'SELECT sum(subtotal) AS total FROM carrito WHERE id_usuario=$1',
                    [id_usuario]
                );

                const valorT = total.rows[0].total;
                const descuento = (porcentaje_descuento / 100) * valorT;
                const newTotal = valorT - descuento;

                console.log("Esto es lo que se descontará=", descuento, "después del descuento=", newTotal);
                res.status(200).json({
                    message: "Esto es lo que se descontará= " + descuento + ", después del descuento= " + newTotal,
                    newTotal:newTotal
                });

                // Insertar el cupón usado en la tabla cupon_usado
                // await client.query(
                //     'INSERT INTO cupon_usado (id_cupon_d, id_usuario) VALUES ($1, $2)',
                //     [id_cupon, id_usuario]
                // );

                // Actualizar el carrito con el nuevo total
                // await client.query(
                //     'UPDATE carrito SET subtotal = $1 WHERE id_usuario = $2',
                //     [newTotal, id_usuario]
                // );

                // Confirmar la transacción
                await client.query('COMMIT');
            }
        } else {
            // Responder que el cupón no fue encontrado
            console.log("cupon no valido");
            res.status(200).json({ message: 'Cupón no encontrado' });
        }

    } catch (error) {
        console.error('Error al procesar la solicitud:', error);

        // En caso de error, hacer rollback de la transacción
        if (client) {
            await client.query('ROLLBACK');
        }

        res.status(500).json({ message: 'Error interno del servidor' });

    } finally {
        if (client) {
            client.release();  // Liberar la conexión a la base de datos
        }
    }
});



router.post("/informacionCliente", async (req, res) => {
    const { id_usuario } = req.body;
    console.log("usuario recibido=", id_usuario);

    // Asegúrate de implementar la función validarToken correctamente
    const resultadoValidacion = validarToken(req, res);

    if (!resultadoValidacion.id_usuario) {
        return res.status(401).json({ message: 'Token no válido' });
    }

    let client;

    try {
        client = await db.connect();
        const informacion = await client.query(
            `SELECT c.nombre, c.apellido_paterno, c.apellido_materno, c.telefono, u.correo, u.id_usuario, c.id_cliente 
             FROM usuario u
             JOIN public.cliente c ON u.id_usuario = c.id_usuario
             WHERE u.id_usuario = $1`,
            [id_usuario]
        );

        const datos = {
            'data': (informacion) ? informacion.rows : null
        };

        res.json(datos);
        client.release();

    } catch (err) {
        console.error(err); // Imprime el error en la consola para depuración
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/realizar_compra', async (req, res) => {
    const {
        id_usuario, correo, nombre, apellido_paterno, apellido_materno, telefono,
        direccion, descripcion, codigo_postal, id_estado, ciudad, id_pais, codigo
    } = req.body;
    // cantidad, subtotal,
    // id_producto,codigo_cupon,
    //validar que el cupon funcione 
    ///secuencia para realizar la compra 
    //primero se insertan los datos de la direccion: en la tabla de direccion(direccion,descripcion,id_cliente,codigo postal, id_states,ciudad)
    //luego insertar los datos en pedido (id_usuario,id_direccion,correo, nombre apellidos, telefono, fecha)
    //luego insertar el total en la venta 
    //calidar el cupon,
    //tomar el id de la venta y el id_pedido eh insertarlo en vanta detalle junto con los siguientes parametros(id_usuaio,id_producto,fecha_insertado,cantidad,subtotal,codigo de cupon,id_venta,id_pedido)

    const resultadoValidacion = validarToken(req, res);
    if (!resultadoValidacion.id_usuario) {
        return res.status(401).json({ message: 'Token no válido' });
    }
    console.log("datos recibidos= ", id_usuario, correo, nombre, apellido_paterno, apellido_materno, telefono,
        direccion, descripcion, codigo_postal, id_estado, ciudad, id_pais, codigo);
});



module.exports = router;
