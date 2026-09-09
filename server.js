const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated ✅",
        userId: req.userId
    });
});

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Skiverse Backend is Running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected ✅");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed ❌");
        console.error(error.message);
    });