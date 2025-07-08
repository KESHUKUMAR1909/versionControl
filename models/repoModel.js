const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    content: [
        {
            type: String,
        },
    ],
    visibility: {
        type: Boolean,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    issues: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Issue",
        }
    ]
}, {
    timeStamps:true
});

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
