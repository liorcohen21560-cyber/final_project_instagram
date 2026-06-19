const postModel = require('../models/postModel');

exports.getFeed = (req, res) => {
    res.json(postModel.getAllPosts());
};

exports.createPost = (req, res) => {
    const addedPost = postModel.addPost(req.body);
    res.status(201).json({ success: true, addedPost });
};

exports.deletePost = (req, res) => {
    const { index } = req.body;
    const isDeleted = postModel.deletePostByIndex(index);
    
    if (isDeleted) {
        return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: "Invalid post index provided." });
};