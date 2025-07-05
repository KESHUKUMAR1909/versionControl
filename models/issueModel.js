const mongoose = require("mongoose");
const { required } = require("yargs");

const IssueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status:{
        type:String,
        enum:["open" , "closed"],
        default:"open",
    },
    repository:{
        type:Schema.Types.ObjectId,
        ref:"Repository",
        required:true,
    },

});
const Issue = mongoose.model("Issue" , IssueSchema);
module.exports = Issue;
