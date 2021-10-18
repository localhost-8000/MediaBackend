const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        min: 5
    },
    displayName: {
        type: String,
        require: true,
        min: 1,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
        max: 50,
        default: "Add Bio..."
    },
    city: {
        type: String,
        max: 50
    },
    from: {
        type: String,
        max: 50
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3]
    }
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)