const express = require("express");
const cors = require("cors");
require("dotenv").config();

// initializing the backend
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
