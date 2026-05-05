const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const teacherRoutes = require('./teacher');
const adminRoutes = require('./admin');
const uploadRoutes = require('./upload');

router.use('/auth', authRoutes);
router.use('/teacher', teacherRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
