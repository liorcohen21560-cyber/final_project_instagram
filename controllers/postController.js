const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const postModel = require('../models/postModel');

exports.getFeed = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching feed." });
    }
};

exports.createPost = async (req, res) => {
    try {
        let postContent = req.body.post_content;

        // If a file was uploaded via GridFS, store the retrieval path/filename
        if (req.file) {
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
            
            const filename = Date.now() + '-' + req.file.originalname;
            
            // Create a readable stream from the buffer and pipe it to GridFS bucket
            const readableStream = require('stream').Readable.from(req.file.buffer);
            const uploadStream = bucket.openUploadStream(filename);
            
            await new Promise((resolve, reject) => {
                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
            
            postContent = `api/posts/file/${filename}`;
        }

        const postData = {
            post_type: req.body.post_type,
            caption: req.body.caption,
            post_content: postContent
        };

        const addedPost = await postModel.addPost(postData);
        res.status(201).json({ success: true, addedPost });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error creating post." });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.body; 
        const isDeleted = await postModel.deletePostById(postId);
        
        if (isDeleted) {
            return res.json({ success: true, message: "Post deleted successfully." });
        }
        res.status(404).json({ success: false, message: "Post not found." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error deleting post." });
    }
};