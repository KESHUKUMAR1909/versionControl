const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
}, { timestamps: true });

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;
