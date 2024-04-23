const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send({ message: "No token provided." });
    }

    const token = bearerHeader.split(' ')[1];
    if (!token) {
        return res.status(403).send({ message: "Bearer token not found." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized! Token is invalid.", error: err });
        }
        req.user = decoded;
        next();
    });
};


module.exports = { verifyToken };

