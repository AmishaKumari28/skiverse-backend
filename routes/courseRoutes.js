const express = require("express");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();

// Temporary storage for uploaded videos
const upload = multer({
    dest: "uploads/"
});


// ======================================================
// CREATE A NEW COURSE + UPLOAD VIDEO
// ======================================================

router.post(
    "/",
    authMiddleware,
    upload.single("video"),
    async (req, res) => {
        try {

            const {
                title,
                description,
                role,
                duration,
                credits
            } = req.body;


            // Check if video was selected
            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a video"
                });
            }


            // Upload video to Cloudinary
            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    resource_type: "video",
                    folder: "skiverse/videos"
                }
            );


            // Create course
            const course = await Course.create({
                title,
                description,
                creatorId: req.userId,
                creator: req.body.creator,
                role,
                duration,
                credits,
                videoUrl: result.secure_url
            });


            res.status(201).json({
                message: "Course and video uploaded successfully",
                course
            });

        } catch (error) {

            console.error("COURSE CREATION ERROR:", error);

            res.status(500).json({
                message: "Course creation failed",
                error: error.message
            });
        }
    }
);


// ======================================================
// GET ALL COURSES
// ======================================================

router.get("/", async (req, res) => {
    try {

        const courses = await Course.find()
            .sort({ createdAt: -1 });

        res.json({
            message: "Courses fetched successfully",
            courses
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch courses",
            error: error.message
        });
    }
});


// ======================================================
// GET SINGLE COURSE
// ======================================================

router.get("/:id", async (req, res) => {
    try {

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.json({
            message: "Course fetched successfully",
            course
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch course",
            error: error.message
        });
    }
});


// ======================================================
// BUY A COURSE
// ======================================================

router.post("/:id/buy", authMiddleware, async (req, res) => {
    try {

        // Find logged-in user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Find course
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }


        // Check if already unlocked
        if (user.unlockedCourses.includes(course._id.toString())) {
            return res.status(400).json({
                message: "Course already unlocked"
            });
        }


        // Check credits
        if (user.credits < course.credits) {
            return res.status(400).json({
                message: "Not enough credits"
            });
        }


        // Deduct credits
        user.credits -= course.credits;


        // Add course to unlocked courses
        user.unlockedCourses.push(course._id.toString());


        // Add purchase to history
        user.history.push({
            courseId: course._id,
            title: course.title,
            creditsSpent: course.credits,
            date: new Date()
        });


        // Save user
        await user.save();


        // Save transaction
        await Transaction.create({
            userId: user._id,
            courseId: course._id,
            creditsSpent: course.credits,
            type: "purchase"
        });


        res.json({
            message: "Course purchased successfully",
            creditsRemaining: user.credits,
            unlockedCourse: course.title
        });

    } catch (error) {

        res.status(500).json({
            message: "Course purchase failed",
            error: error.message
        });
    }
});


module.exports = router;