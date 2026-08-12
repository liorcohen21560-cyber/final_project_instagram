const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const postController = require('../controllers/postController');

// Use memory storage so multer holds the file buffer in memory temporarily
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

router.get('/api/posts', postController.getFeed);
router.post('/api/posts', upload.single('mediaFile'), postController.createPost); // Use multer middleware to handle file upload to MongoDB GridFS
router.post('/api/posts/delete', postController.deletePost);
router.get('/api/gifs', postController.searchGifs);
router.get('/statistics/top-users', postController.getTopActiveUsers);
router.post('/api/facebook/post', postController.postToFacebook);

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

        const contentType = file.contentType || (file.filename.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream');
        res.set('Accept-Ranges', 'bytes');
        res.set('Content-Type', contentType);

        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;

            if (Number.isNaN(start) || Number.isNaN(end) || start >= file.length || end >= file.length) {
                res.set('Content-Range', `bytes */${file.length}`);
                return res.sendStatus(416);
            }

            res.status(206);
            res.set('Content-Range', `bytes ${start}-${end}/${file.length}`);
            res.set('Content-Length', end - start + 1);

            if (req.method === 'HEAD') return res.end();

            return bucket.openDownloadStream(file._id, { start, end: end + 1 }).pipe(res);
        }

        res.set('Content-Length', file.length);
        if (req.method === 'HEAD') return res.end();

        const downloadStream = bucket.openDownloadStream(file._id);
        downloadStream.pipe(res);
    } catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).json({ success: false, message: "Error retrieving file" });
    }
});

module.exports = router;
