const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../utils/dataStore');

const router = express.Router();

// Credentials from environment variables
const VALID_API_KEY = process.env.VALID_API_KEY;
const VALID_USERNAME = process.env.VALID_USERNAME;
const VALID_PASSWORD = process.env.VALID_PASSWORD;

// POST /auth/login/apikey - API Key Login
router.post('/login/apikey', (req, res) => {
    const { apiKey } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: 'apiKey is required' });
    }

    if (apiKey !== VALID_API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    const accessToken = `BEARER-APIKEY-${uuidv4().substring(0, 8).toUpperCase()}`;

    dataStore.saveToken(accessToken, { method: 'API_KEY' });

    res.json({
        accessToken,
        method: 'API_KEY',
        expiresIn: 3600
    });
});

// POST /auth/login - Username/Password Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = `BEARER-USER-${uuidv4().substring(0, 8).toUpperCase()}`;

    dataStore.saveToken(accessToken, { method: 'CREDENTIALS' });

    res.json({
        accessToken,
        method: 'CREDENTIALS',
        expiresIn: 3600
    });
});

module.exports = router;
