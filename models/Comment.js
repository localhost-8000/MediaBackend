const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    comment: {
        type: String,
        max: 500
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: []
    }],
}, {timestamps: true})

module.exports = mongoose.model("Comment", CommentSchema);