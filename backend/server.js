const express = require("express");
const mongoose = require('mongoose');

const app = express();

const PORT = 5000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devshelf';

app.get("/", (req, res) => {
  res.send("DevShelf Backend Running");
});

app.listen(5000, () => {
  console.log("Server Started");
});

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