const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const User = require('../models/User');
const auth = require("../middleware/auth");



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
        const {updatedAt, ...otherData} = user._doc;
        res.status(200).json(otherData);
    } catch (err) {
        res.status(500).json(err);
    }
})

// get friends..
router.get("/friends/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const friends = [];
        for await (const friendId of user.followings) {
            let user = User.findById(friendId);
            friends.push(user);
        }
        // const friends = await Promise.all(
        //     user.followings.map(friendId => {
        //         return User.findById(friendId);
        //     })
        // )
        let friendList = [];
        friends.map(friend => {
            const { username, profilePicture, displayName } = friend;
            friendList.push({ username, profilePicture, displayName });
        })
        res.status(200).json(friendList);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
})

// get all users(not friends)..
router.post("/all-users", auth, async (req, res) => {
    try {
        const username = req.body.username;
        const adminUser = await User.findOne({username: username});
        const allUsers = await User.find();
        Promise.all([adminUser, allUsers]).then(values => {
            let adminUser = values[0];
            // console.log('admin: ', adminUser);
            let allUsers = values[1];
            // console.log('all', allUsers);
            const result = [];
            allUsers.forEach(user => {
                if(user.email !== adminUser.email && !adminUser.followings.includes(user._id)) {
                    result.push({
                        username: user.username,
                        profilePicture: user.profilePicture,
                        displayName: user.displayName
                    })
                }
            });
            res.status(200).json(result);
        });
        // allUsers = allUsers.map(user => {
        //     if(user.email !== adminUser.email && !adminUser.followings.includes(user._id)) {
        //         return {
        //             username: user.username,
        //             profilePicture: user.profilePicture,
        //             displayName: user.displayName
        //         }
        //     }
        // });
    } catch (err) {
        console.error(err);
        res.status(500).json("Some error occurred!");
    }
});


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
        }).then((doc, err) => {
            if(err) {
                res.status(403).json("Error occured");
            }
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
        }).then((doc, err) => {
            if(err) {
                res.status(403).json("Error occured");
            }
        });
        res.status(200).json("cover picture updated");
    } catch (err) {
        console.log(err);
        res.status(404).json("Invalid request");
    }
});



module.exports = router