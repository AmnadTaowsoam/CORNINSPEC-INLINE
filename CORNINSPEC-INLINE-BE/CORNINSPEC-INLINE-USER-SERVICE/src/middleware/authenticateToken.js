// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Middleware to authenticate JWT tokens.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next The next middleware function in the stack.
 */
const authenticateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token == null) {
        console.error('Authentication token is missing.');
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Invalid or expired token:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        req.user = user;
        next();
    });
});

module.exports = authenticateToken;
