const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'niet-academic-jwt-super-secret-key-2026-quality-education-sdg4';

function verifyAuth(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return { error: 'Missing authorization header', status: 401 };

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { user: decoded };
    } catch (err) {
        return { error: 'Invalid or expired session token', status: 403 };
    }
}

module.exports = { verifyAuth, JWT_SECRET };
