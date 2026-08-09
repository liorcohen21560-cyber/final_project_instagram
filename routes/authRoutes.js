const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authControllers');
const groupController = require('../controllers/groupControllers');
const locationController = require('../controllers/locationControllers');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', authController.login);
router.get('/api/current-user', authController.getCurrentUser);
router.post('/add-friend', authController.addFriend);
router.post('/remove-friend', authController.removeFriend);
router.get('/index2.html', authController.protectFeed);
router.post('/register', authController.register);
router.delete('/delete-account', authController.deleteAccount);
router.put('/update-username', authController.updateUsername);
router.post('/create-group', upload.single('groupProfileImage'), groupController.createGroup);
router.delete('/delete-group', groupController.deleteGroup);
router.put('/update-group-name', groupController.updateGroupName);
router.post('/add-user-to-group', groupController.addUserToGroup);
router.post('/join-group', groupController.joinGroup);
router.post('/leave-group', groupController.leaveGroup);
router.post('/remove-from-group', groupController.removeUserFromGroup);
router.get('/search-all', groupController.searchAll);
router.get('/group-members/:groupName', groupController.getGroupMembers);
router.get('/statistics/groups', groupController.getGroupStatistics);


router.get('/locations', locationController.getLocations);
router.post('/locations', locationController.addLocation);
router.put('/locations/:id', locationController.updateLocation);
router.delete('/locations/:id', locationController.deleteLocation);

module.exports = router;