const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    repositories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            default: []
        }
    ],
    followedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    StarRepos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            default: []
        }
    ],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
