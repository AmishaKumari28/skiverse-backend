const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        creator: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "Student"
        },

        duration: {
            type: String,
            required: true
        },

        credits: {
            type: Number,
            required: true,
            min: 1
        },

        videoUrl: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;