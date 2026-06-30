const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getCookieValue(cookieHeader, key) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${key}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return getCookieValue(req.headers.cookie, 'devshelf_token');
}

async function attachUserFromToken(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from the backend environment');
  }

  const payload = jwt.verify(token, secret);
  const user = await User.findById(payload.id);
  if (!user) return null;

  req.user = user;
  return user;
}

async function protect(req, res, next) {
  try {
    const user = await attachUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Please log in to continue' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Invalid or expired token' });
  }
}

async function optionalAuth(req, _res, next) {
  try {
    await attachUserFromToken(req);
  } catch {
    req.user = null;
  }

  next();
}

function checkRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Please log in to continue' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that' });
    }

    next();
  };
}

module.exports = {
  protect,
  optionalAuth,
  checkRole,
  restrictTo: checkRole,
};
