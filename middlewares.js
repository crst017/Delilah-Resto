const token = require('./token');

const verify = {
    admin : (req,res,next) => {
        const auth = req.headers.authorization;

        if (!auth.startsWith("Bearer ")) return;
        const reqToken = auth.substring(7, auth.length);
        const userInfo = token.decode(reqToken);

        if (userInfo.role === "admin") next()
        else res.status(403).send("Acceso no autorizado")
    },
    token : (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') res.status(404).send('No se encontró un token valido');
        console.log("Estoy pasando")
    }
}

module.exports = verify

