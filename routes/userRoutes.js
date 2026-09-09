const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's information
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User data fetched successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user data",
            error: error.message
        });
    }
});

// Get user's purchase history
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("history");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "History fetched successfully",
            history: user.history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch history",
            error: error.message
        });
    }
});

module.exports = router;