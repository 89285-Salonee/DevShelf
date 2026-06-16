const jwt = require('jsonwebtoken');
const User = require("../models/User");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from the backend environment');
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sendAuthResponse(user, statusCode, res) {
  const token = signToken(user);

  if (process.env.JWT_COOKIE_ENABLED === 'true') {
    res.cookie('devshelf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

   res.status(statusCode).json({
    token,
    user: user.toJSON(),
  });
}

async function register(req, res) {
try {
const { username, email, password } = req.body;

if (!username || !email || !password) {
  return res.status(400).json({
    error: "Username, email, and password are required",
  });
}

const existingUser = await User.findOne({
  $or: [
    { email: email.toLowerCase() },
    { username }
  ],
});

if (existingUser) {
  return res.status(409).json({
    error: "A user with that email or username already exists",
  });
}

const userCount = await User.countDocuments();

const assignedRole =
  userCount === 0 ? "admin" : "user";

const user = await User.create({
  username,
  email,
  password,
  role: assignedRole,
});

return res.status(201).json({
  message: "User registered successfully",
  user,
});


  return sendAuthResponse(user, 201, res);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
try {
const { email, password } = req.body;

// Check required fields
if (!email || !password) {
  return res.status(400).json({
    error: "Email and password are required",
  });
}

// Find user
const user = await User.findOne({
  email: email.toLowerCase(),
}).select("+password");

// Check user and password
if (!user || !(await user.comparePassword(password))) {
  return res.status(401).json({
    error: "Invalid email or password",
  });
}

// Generate token and send response
return sendAuthResponse(user, 200, res);
} catch (err) {
return res.status(400).json({
error: err.message,
});
}
}

async function me(req, res) {
  res.json({ user: req.user.toJSON() });
}

function logout(_req, res) {
  res.clearCookie('devshelf_token');
  res.json({ message: 'Logged out successfully' });
}

module.exports = { 
  register,
  login,
  me,
  logout,
 };
