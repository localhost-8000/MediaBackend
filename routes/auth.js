const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt')

const User = require("../models/User");

router.get('/', (req, res) => {
    res.send('auth route')
})


// register user.........
router.post("/register", async (req, res) => {
    
    try {
        // generate new hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        
        // create user 
        const user = new User({
            username: req.body.username,
            password: hashedPass,
            email: req.body.email
        })

        let newUser = await user.save();
        res.status(200).json(newUser);
    }
    catch(err) {
        res.status(500).json(err);
    }
}) 

// login user.......
router.post("/login", async (req, res) => {
    try {

        const user = await User.findOne({ email: req.body.email })
        if( !user ) {
            res.status(404).json("user not found");
        }
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if( !validPass ) {
            res.status(400).json("password is invalid");
        }
        res.status(200).json(user)

    }
    catch( err ) {
        res.status(500).json(err);
    }
})


module.exports = router