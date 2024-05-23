const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken"); // Importa jsonwebtoken
const db = require("../database/connection");
const prisma = require("../database/conn");
const router = express.Router();
const verificarToken = require("./verificaToken");
///innicio de sesion

router.post("/usuario/login", async (req, res) => {
  const { correo, password } = req.body; // Obtener correo y password desde el cuerpo de la solicitud

  try {
    // Encriptación de la contraseña (se recomienda usar un algoritmo más seguro)
    const password_encriptada = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    const client = await db.connect();
    const result = await client.query(
      "SELECT * FROM usuario WHERE correo = $1 AND password = $2",
      [correo, password_encriptada]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign(
        { id_usuario: user.id_usuario, correo: user.correo },
        "secreto"
      ); // Reemplazar 'secreto' con una cadena segura

      // Imprimir la contraseña encriptada en la consola
      console.log(password_encriptada);

      // Opcional: Insertar en la tabla de sesión

      res.json({ message: "Inicio de sesión exitoso", token: token, user });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
      console.log(password_encriptada);
    }

    client.release();
  } catch (err) {
    console.error(err);
    // Mejorar el manejo de errores para proporcionar información específica al usuario
    res.status(500).send("Error: " + err.message);
  }
});

router.post("/usuario/registro", async (req, res) => {
  const {
    correo,
    password,
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    fecha_nacimiento,
  } = req.body;
  const id_rol = 2;
  const password_encriptada = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  // Fecha actual en formato ISO (UTC)
  const fecha_registro = new Date().toISOString();
  //conecta a la base de datos
  const client = await db.connect();
  try {
    const buscar_usuario = await client.query(
        'SELECT EXISTS(SELECT 1 FROM usuario WHERE correo=$1)',
        [correo]
      );
  
      if (buscar_usuario.rows[0].exists) {
        res.json({
          message: 'Registro No Exitoso por email duplicado',
        });
        return;
      }
      //inicio de la transaccion
      await client.query("BEGIN");

      //insertar a tabla usuario
      const inserta_Usuario = await client.query(
        "INSERT INTO usuario(correo, password, id_rol, fecha_registro) VALUES($1, $2, $3, $4)",
        [correo, password_encriptada, id_rol, fecha_registro]
      );
      //obtener el ultimo id de la tabla de usuario
      const last_id = await client.query(
        "SELECT * FROM usuario ORDER BY id_usuario DESC LIMIT 1"
      );
      const user = last_id.rows[0];
      id_usuario = user.id_usuario;
      //insertar a la tabla cliente el ultimo usuario registrado
      await client.query(
        "INSERT INTO cliente(nombre, apellido_paterno, apellido_materno, telefono, fecha_nacimiento, id_usuario) VALUES($1, $2, $3, $4, $5, $6)",
        [
          nombre,
          apellido_paterno,
          apellido_materno,
          telefono,
          fecha_nacimiento,
          id_usuario,
        ]
      );
      // Confirmar transacción
      await client.query("COMMIT");
      res.json({
        message: "Registro Exitoso",
      });
    }
  catch (err) {
    // Revertir transacción en caso de error
    await client.query("ROLLBACK");
    console.error("Error al registrar usuario:", err);
    res.status(500).json({
      message: "Error al registrar usuario",
    });
  } finally {
    // Liberar el cliente de la conexión a la base de datos
    client.release();
  }
});

router.get("/usuario", async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.query("select * from usuario");
    const results = { data: result ? result.rows : null };
    res.json(results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

router.put("/usuario/:id", async (req, res) => {
  const id = req.params.id;

  const {
    correo,
    password,
    id_rol,
    nombre,
    apellido_paterno,
    apellido_materno,
    telefono,
    fecha_nacimiento,
  } = req.body; // Corrección aquí

  const updateUsuario = await prisma.usuario.update({
    where: {
      id_usuario: parseInt(id),
    },
    data: {
      correo,
      password,
      id_rol,
    },
  });

  if (
    nombre &&
    apellido_paterno &&
    apellido_materno &&
    telefono &&
    fecha_nacimiento
  ) {
    const updateCliente = await prisma.cliente.update({
      where: {
        id_usuario: parseInt(id),
      },
      data: {
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        fecha_nacimiento,
      },
    });
    res.json({
      usuario: updateUsuario,
      cliente: updateCliente,
    });
  } else {
    res.json({
      usuario: updateUsuario,
    });
  }
});

router.delete("/usuario/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const deleteDireccion = await prisma.direccion.delete({
      where: {
        id_cliente: parseInt(id),
      },
    });
    const deleteCliente = await prisma.cliente.delete({
      where: {
        id_cliente: parseInt(id),
      },
    });
    const deleteUsuario = await prisma.usuario.delete({
      where: {
        id_usuario: parseInt(deleteCliente[0].id_usuario),
      },
    });

    res.json({
      cliente: deleteCliente,
      usuario: deleteUsuario,
    });
  } catch (error) {
    res.json({
      error: error.message,
      details: error.meta || null,
    });
  }
});

router.get("/clientes", async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
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
