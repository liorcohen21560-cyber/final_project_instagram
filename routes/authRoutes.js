const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');

router.post('/login', authController.login);
router.get('/index2.html', authController.protectFeed);
router.post('/register', authController.register);
router.delete('/delete-account', authController.deleteAccount);
router.put('/update-username', authController.updateUsername);
router.get('/search-users', authController.searchUsers);


router.get('/api/current-user', (req, res) => {
    if (req.session && req.session.username) {
        res.json({ 
            username: req.session.username,
            user_profile_image: req.session.user_profile_image 
        });
    } else {
        res.status(401).json({ username: null, user_profile_image: null });
    }
});

module.exports = router;