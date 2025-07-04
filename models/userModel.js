const mongoose = require('mongoose');
const { required } = require('yargs');
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
            default: [],
            type: Schema.Types.OhjectId,
            ref: "Repository",
        }
    ],
    followedUsers: [
        {
            default: [],
            type: Schema.Types.OhjectId,
            ref: "User",
        }
    ],
    StartRepos: [
        {
            default: [],
            type: Schema.Types.OhjectId,
            ref: "Repository",
        }
    ],


});

const User = mongoose.model("User" , UserSchema);
export default User;