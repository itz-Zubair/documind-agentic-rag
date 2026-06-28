// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    // Read token from incoming cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Check if token exists
    if (!token || token === 'none') {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        // Verify token signatures against our JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to the request object
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Session expired or invalid token' });
    }
};