const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/api/posts', postController.getFeed);
router.post('/api/posts', postController.createPost);
router.post('/api/posts/delete', postController.deletePost);

module.exports = router;