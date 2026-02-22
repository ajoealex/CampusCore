const dataStore = require('../utils/dataStore');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const tokenData = dataStore.validateToken(token);
    if (!tokenData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.tokenData = tokenData;
    next();
}

module.exports = { authenticateToken };
