const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;