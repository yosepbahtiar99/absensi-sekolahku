const express = require('express');
const router = express.Router();
const { login, refreshToken, logout } = require('../controllers/authController');

router.post('/login', login);
router.get('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
