const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ 'message': 'Token no proporcionado' });
    }

    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(500).json({ 'message': 'Error al autenticar el token' });
        }

        req.usuario = decoded;
        next();
    });
}

module.exports = verificarToken;
