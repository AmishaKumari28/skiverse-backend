const express = require("express");
const Rating = require("../models/Rating");
const Course = require("../models/Course");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add a rating and review
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { courseId, rating, review } = req.body;

        // Check course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Check user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check if course is unlocked
        if (!user.unlockedCourses.includes(courseId)) {
            return res.status(403).json({
                message: "You must unlock the course before rating it"
            });
        }

        // Check if user already rated this course
        const existingRating = await Rating.findOne({
            courseId,
            userId: req.userId
        });

        if (existingRating) {
            return res.status(400).json({
                message: "You have already rated this course"
            });
        }

        // Create rating
        const newRating = await Rating.create({
            courseId,
            userId: req.userId,
            rating,
            review
        });

        // Calculate average rating
        const ratings = await Rating.find({ courseId });

        const totalRating = ratings.reduce(
            (sum, item) => sum + item.rating,
            0
        );

        const averageRating = totalRating / ratings.length;

        // Update course rating
        course.rating = Number(averageRating.toFixed(1));
        await course.save();

        res.status(201).json({
            message: "Rating added successfully",
            rating: newRating,
            courseRating: course.rating
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add rating",
            error: error.message
        });
    }
});

// Get ratings for a course
router.get("/:courseId", async (req, res) => {
    try {
        const ratings = await Rating.find({
            courseId: req.params.courseId
        })
        .populate("userId", "name")
        .sort({ createdAt: -1 });

        res.json({
            message: "Ratings fetched successfully",
            ratings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch ratings",
            error: error.message
        });
    }
});

module.exports = router;