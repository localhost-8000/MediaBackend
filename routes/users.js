const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const User = require('../models/User')



// update user.......
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch( err ) {
                return res.status(500).json(err)
            }
        }


        try {
            
            const user = await User.findOneAndUpdate({_id: req.params.id}, {
                $set: req.body
            })
            res.status(200).json("account updated")

        } catch (err) {
            return res.status(500).json(err);
        }

    } else {
        return res.status(403).json("Yoy can update only your account!")
    }
})


// delete user.......
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {

        try {
            
            await User.deleteOne({_id: req.params.id})
            res.status(200).json("account has been deleted")

        } catch (err) {
            return res.status(500).json(err);
        }

    } else {
        return res.status(403).json("Yoy can delete only your account!")
    }
})

// get a user........
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId 
            ? await User.findById(userId) 
            : await User.findOne({ username: username });
        const {password, updatedAt, ...otherData} = user._doc
        res.status(200).json(otherData);
    } catch (err) {
        res.status(500).json(err);
    }
})

// get friends..
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => {
                return User.findById(friendId);
            })
        )
        let friendList = [];
        friends.map(friend => {
            const { _id, username, profilePicture } = friend;
            friendList.push({ _id, username, profilePicture });
        })
        res.status(200).json(friendList);
    } catch (err) {
        res.status(500).json(err);
    }
})


// follow a user......
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({
                    $push: {
                        followers: req.body.userId
                    }
                })
                await currentUser.updateOne({
                    $push: {
                        followings: req.params.id
                    }
                })
                res.status(200).json("followed user")
            } else {
                res.status(403).json("you already following")
            }
        } catch (error) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't follow yourself")
    }
})


// unfollow a user.....
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            console.log(req.body.userId);
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({
                    $pull: {
                        followers: req.body.userId
                    }
                })
                await currentUser.updateOne({
                    $pull: {
                        followings: req.params.id
                    }
                })
                res.status(200).json("unfollowed user")
            } else {
                res.status(403).json("you don't follow this user")
            }
        } catch (error) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can't unfollow yourself")
    }
})

router.post("/profile/upload", async (req, res) => {
    const userId = req.body.userId;
    const imageUrl = req.body.imageUrl;
    try {
        const user = await User.findById(userId);
        user.updateOne({
            profilePicture: imageUrl
        });
        res.status(200).json("profile picture updated");
    } catch (err) {
        res.status(404).json("Invalid request");
    }
})

router.post("/cover/upload", async (req, res) => {
    const userId = req.body.userId;
    const imageUrl = req.body.imageUrl;
    try {
        const user = await User.findById(userId);
        user.updateOne({
            coverPicture: imageUrl
        });
        res.status(200).json("cover picture updated");
    } catch (err) {
        res.status(404).json("Invalid request");
    }
});


module.exports = router