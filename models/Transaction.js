const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        creditsSpent: {
            type: Number,
            required: true
        },

        type: {
            type: String,
            default: "purchase"
        }
    },
    {
        timestamps: true
    }
);

const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);

module.exports = Transaction;