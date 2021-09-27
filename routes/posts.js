const express = require('express');
const router = express.Router();

const Post = require('../models/Post')
const User = require('../models/User')

//===create a post========

router.post("/", async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save((err, doc) => {
            if(err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(doc);
            }
        });
    } catch (err) {
        res.status(500).json(err)
    }
})

//===update post=========

router.put("/:id", async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.updateOne({$set: req.body});
            res.status(200).json("post updated");
        } else {
            res.status(403).json("you can update only your post");
        }

    } catch (err) {
        res.status(500).json(err);
    }
})

//=====delete post======

router.delete("/:id", async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("post deleted");
        } else {
            res.status(403).json("you can delete only your post");
        }

    } catch (err) {
        res.status(500).json(err);
    }
})


//======like post=========

router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push: {likes: req.body.userId}})
            res.status(200).json("you liked the post");
        } else {
            await post.updateOne({$pull: { likes: req.body.userId }});
            res.status(200).json("you disliked the post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

//========get post===========

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})


// ======get timeline posts=======

router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map( async (friendId) => {
                return await Post.find({ userId: friendId })
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

// ======get users all posts=======

router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username});
        const posts = await Post.find({userId: user._id})
        res.status(200).json(posts);
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})




module.exports = router