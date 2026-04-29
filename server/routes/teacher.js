const express = require('express');
const router = express.Router();
const { getMySchedule, submitAttendance } = require('../controllers/teacherController');
const { verifyToken, isGuru } = require('../middleware/auth');

router.get('/schedule', verifyToken, isGuru, getMySchedule);
router.post('/attendance', verifyToken, isGuru, submitAttendance);

module.exports = router;
