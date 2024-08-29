const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { findUserByUsername } = require('../models/userModel');
const { createRefreshToken, getRefreshToken, deleteRefreshToken } = require('../models/refreshTokenModel');

const router = express.Router();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    console.error('Error: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set');
    process.exit(1);
}

const generateAccessToken = (userId, username, role) => {
    return jwt.sign({ userId, username, role }, ACCESS_TOKEN_SECRET, { expiresIn: '1440m' });
};

const generateRefreshToken = async (userId) => {
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createRefreshToken(userId, refreshToken, expiresAt);
    return refreshToken;
};

const validateLogin = [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('password').not().isEmpty().withMessage('Password is required')
];

router.post('/login', validateLogin, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.pwd)) {
        const accessToken = generateAccessToken(user.user_id, user.username, user.roles); 
        const refreshToken = await generateRefreshToken(user.user_id);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', path: '/api/auth/refreshToken' });
        return res.json({ 
            accessToken, 
            refreshToken, 
            roles: user.roles,
            port: user.port
        });
    } else {
        console.error('Invalid username or password');
        return res.status(401).json({ message: 'Username or password is incorrect' });
    }
}));

router.post('/refreshToken', asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
        console.error('Invalid refresh token:', error.message);
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const tokenData = await getRefreshToken(refreshToken);
    if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
        return res.status(403).json({ message: 'Expired refresh token' });
    }

    const newAccessToken = generateAccessToken(payload.userId, tokenData.username);

    res.json({ accessToken: newAccessToken });
}));

router.post('/logout', asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    const tokenData = await getRefreshToken(refreshToken);
    if (!tokenData) {
        return res.status(200).json({ message: 'Logged out successfully or token was invalid' });
    }

    await deleteRefreshToken(refreshToken);

    res.cookie('refreshToken', '', { maxAge: 0, path: '/api/auth/refreshToken' });

    return res.status(200).json({ message: 'Logged out successfully' });
}));

module.exports = router;
