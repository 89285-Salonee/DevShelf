const express = require("express");
const mongoose = require('mongoose');
const authRouter = require("./routes/auth");
const cors = require('cors');
require('dotenv').config();

const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devshelf';

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("DevShelf Backend Running");
});

app.listen(5000, () => {
  console.log("Server Started");
});

app.post("/test", (req, res) => {
  res.json({
    message: "POST route working",
  });
});


app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});


// Database + server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`DevShelf server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });