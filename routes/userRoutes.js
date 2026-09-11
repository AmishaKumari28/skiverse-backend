const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
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

        const history = await Promise.all(
            user.history.map(async (item) => {
                const course = await Course.findById(item.courseId);

                return {
                    courseId: item.courseId,
                    title: item.title,
                    description: course?.description || "",
                    creator: course?.creator || "",
                    role: course?.role || "",
                    duration: course?.duration || "",
                    credits: course?.credits ?? item.creditsSpent,
                    rating: course?.rating ?? 0,
                    videoUrl: course?.videoUrl || "",
                    creditsSpent: item.creditsSpent,
                    date: item.date
                };
            })
        );

        res.json({
            message: "History fetched successfully",
            history
        });

    } catch (error) {
        console.error("HISTORY ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch history",
            error: error.message
        });
    }
});

module.exports = router;