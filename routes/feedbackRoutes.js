const express = require("express");
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Submit feedback
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            name,
            email,
            experience,
            improvement,
            feature,
            rating
        } = req.body;

        // Check required fields
        if (
            !name ||
            !email ||
            !experience ||
            !improvement ||
            !feature ||
            !rating
        ) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

        // Check if user has already submitted feedback
        const existingFeedback = await Feedback.findOne({
            userId: req.userId
        });

        if (existingFeedback) {
            return res.status(400).json({
                message: "You have already submitted your feedback."
            });
        }

        // Create feedback
        const newFeedback = new Feedback({
            userId: req.userId,
            name,
            email,
            experience,
            improvement,
            feature,
            rating: Number(rating)
        });

        await newFeedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully!",
            feedback: newFeedback
        });

    } catch (error) {
        console.error("FEEDBACK ERROR:", error);

        res.status(500).json({
            message: "Failed to submit feedback.",
            error: error.message
        });
    }
});

// Check whether logged-in user has submitted feedback
router.get("/status", authMiddleware, async (req, res) => {
    try {
        const feedback = await Feedback.findOne({
            userId: req.userId
        });

        res.json({
            submitted: !!feedback
        });

    } catch (error) {
        console.error("FEEDBACK STATUS ERROR:", error);

        res.status(500).json({
            message: "Failed to check feedback status."
        });
    }
});

module.exports = router;

