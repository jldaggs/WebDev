const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send({ message: "No token provided." });
    }

    // Attempt to split the header into the 'Bearer' keyword and the actual token
    const parts = bearerHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).send({ message: "Token format is 'Bearer <token>'." });
    }

    const token = parts[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.userId;
        next();
    });
};

module.exports = { verifyToken };

