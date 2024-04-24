const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send({ message: "No token provided." });
    }

    const parts = bearerHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).send({ message: "Token format is 'Bearer <token>'." });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        

        req.user = decoded; // This sets the entire decoded token object to req.user

        next();
    });
};

module.exports = { verifyToken };
