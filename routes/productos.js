<<<<<<< HEAD
const express = require('express')
const db = require('../database/connection')
const router = express.Router()

router.get('/product', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('select * from producto');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
=======
const express = require('express')
const db = require('../database/connection')
const router = express.Router()


router.get('/product', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('select * from producto');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

module.exports = router;
>>>>>>> fcaffa2ab540678498f91c844122c1d255cfb4f6
