const express = require('express')
const db = require('../database/connection')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('GET request to the homepage')
})


router.get('/rol', async (req, res) => {
    try {
        const client = await db.connect();
        const result = await client.query('SELECT * FROM rol');
        const results = { 'data': (result) ? result.rows : null };
        res.json(results);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});
module.exports = router;