const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const postController = require('../controllers/postController');

// Use memory storage so multer holds the file buffer in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

router.get('/api/posts', postController.getFeed);
router.get('/api/posts/my-posts', postController.getMyPosts);
router.post('/api/posts', upload.single('mediaFile'), postController.createPost); // Use multer middleware to handle file upload to MongoDB GridFS
router.post('/api/posts/delete', postController.deletePost);
router.post('/api/posts/:id/like', postController.toggleLike);
router.post('/api/posts/:id/comment', postController.addComment);
router.get('/api/gifs', postController.searchGifs);
router.get('/statistics/top-users', postController.getTopActiveUsers);
router.get('/statistics/user-post-types', postController.getUserPostTypeStats);
router.post('/api/facebook/post', postController.postToFacebook);
router.put('/api/posts/:id/caption', postController.updatePostCaption);

// File retrieval route to stream media from MongoDB GridFS back to the frontend
router.get('/api/posts/file/:filename', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

        const filesCollection = db.collection('uploads.files');
        const file = await filesCollection.findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
        downloadStream.pipe(res);
    } catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).json({ success: false, message: "Error retrieving file" });
    }
});

module.exports = router;