const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");

const User = require("../models/User");


// register user.........
router.post("/register", auth, async (req, res) => {
    
    try {
        // create user 
        let username = `@${req.body.name}${Date.now()}`;
        username.replace(" ", "");
        const user = new User({
            displayName: req.body.name,
            email: req.body.email,
            profilePicture: req.body.photourl,
            username: username
        });

        let newUser = await user.save();
        res.status(200).json(newUser);
    }
    catch(err) {
        console.error(err);
        res.status(500).json(err);
    }
}) 

// login user.......
router.post("/login", auth, async (req, res) => {
    try {
        const email = req.user.email;
        const user = await User.findOne({email: email});
        res.status(200).json(user);
    }
    catch(err) {
        console.error(err);
        res.status(500).json(err);
    }
})


module.exports = router;