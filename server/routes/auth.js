const express = require('express');
const router = express.Router();
const { login, refreshToken, logout, changePassword, uploadPhoto } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const uploadProfile = require('../middleware/uploadProfile');

router.post('/login', login);
router.get('/refresh', refreshToken);
router.post('/logout', logout);
router.put('/change-password', verifyToken, changePassword);
router.post('/upload-photo', verifyToken, uploadProfile.single('photo'), uploadPhoto);

module.exports = router;
