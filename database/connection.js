<<<<<<< HEAD
const { Pool } = require('pg');
const db = new Pool({

    // user:'cuchau_store_user',
    // host: 'dpg-co0efm2cn0vc73cb92ug-a.oregon-postgres.render.com',
    // database: 'cuchau_store',
    // password: '1aesvAmf7POuomnsrHWLsledtq0Dg352',
    // port: 5432,
    // //esto es para render
    // ssl: true
    user:'migueldb',
    host: '172.19.116.163',
    database: 'cuchaustore',
    password: '123',
    user: 'cuchau_store_user',
    host: 'dpg-co0efm2cn0vc73cb92ug-a.oregon-postgres.render.com',
    database: 'cuchau_store',
    password: '1aesvAmf7POuomnsrHWLsledtq0Dg352',

    port: 5432,
    //esto es para render
    //ssl: true
});

=======
const { Pool } = require('pg');
const db = new Pool({

    // user:'cuchau_store_user',
    // host: 'dpg-co0efm2cn0vc73cb92ug-a.oregon-postgres.render.com',
    // database: 'cuchau_store',
    // password: '1aesvAmf7POuomnsrHWLsledtq0Dg352',
    // port: 5432,
    //ssl: true
    user:'migueldb',
    host: 'dpg-cp2f4b6v3ddc73cl7gpg-a.oregon-postgres.render.com',
    database: 'cuchaustore_g50j',
    password: 'XEZZez4Jom8fYW6ePQRbqZgzASEEjP5k',
    port: 5432,
    //esto es para render
   ssl: true
});

>>>>>>> fcaffa2ab540678498f91c844122c1d255cfb4f6
module.exports = db;