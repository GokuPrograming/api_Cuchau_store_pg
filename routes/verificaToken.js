
const jwt = require('jsonwebtoken');


const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido' });
        }
        req.usuario = decoded;
        next();
    });
};

module.exports = verificarToken;

