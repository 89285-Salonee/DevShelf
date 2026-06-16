const User = require("../models/User");

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


} catch (err) {
return res.status(400).json({
error: err.message,
});
}
}

module.exports = { register };
