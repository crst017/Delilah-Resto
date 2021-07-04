const token = require('./token');

const verify = {
    admin : (req,res,next) => {

        const headers = req.headers;
        const userInfo = token.decode(headers);
        
        if (userInfo.role === "admin") next()
        else res.status(403).send("Not authorized access")
    },
    token : (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') res.status(401).send('Auth token not found');
    }
}

module.exports = verify

