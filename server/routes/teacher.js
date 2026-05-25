const express = require('express');
const router = express.Router();
const { getMySchedule, submitAttendance, getScheduleDetail, getMyActivities, createApprovalRequest, getMyApprovalRequests, corporateClockIn, corporateClockOut, getSettings, getDailyAttendanceStatus } = require('../controllers/teacherController');
const { verifyToken, isGuru } = require('../middleware/auth');

router.use(verifyToken, isGuru);

router.get('/settings', getSettings);
router.get('/schedule', getMySchedule);
router.get('/schedule/:id', getScheduleDetail);
router.post('/attendance', submitAttendance);
router.post('/attendance/corporate-clock-in', corporateClockIn);
router.post('/attendance/corporate-clock-out', corporateClockOut);
router.get('/attendance/daily-status', getDailyAttendanceStatus);
router.get('/activities', getMyActivities);
router.post('/requests', createApprovalRequest);
router.get('/requests', getMyApprovalRequests);

module.exports = router;
