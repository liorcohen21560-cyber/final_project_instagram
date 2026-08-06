const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const groupController = require('../controllers/groupControllers');



router.post('/login', authController.login);
router.get('/index2.html', authController.protectFeed);
router.post('/register', authController.register);
router.delete('/delete-account', authController.deleteAccount);
router.put('/update-username', authController.updateUsername);
router.post('/create-group', groupController.createGroup);
router.delete('/delete-group', groupController.deleteGroup);
router.put('/update-group-name', groupController.updateGroupName);
router.post('/add-user-to-group', groupController.addUserToGroup);
router.get('/search-all', groupController.searchAll);
router.get('/group-members/:groupName', groupController.getGroupMembers);
router.get('/statistics/groups', groupController.getGroupStatistics);



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