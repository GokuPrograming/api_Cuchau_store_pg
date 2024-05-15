const express = require('express')
const db = require('../database/connection')
const router = express.Router()


router.get('/proveedor', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('select * from proveedor');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

router.get('/proveedor/:oid', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('select * from proveedor where id_proveedor = $1', [req.params.oid]);
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});


module.exports = router;