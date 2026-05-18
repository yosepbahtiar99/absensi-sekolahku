const express = require('express');
const router = express.Router();
const { 
  getDashboardSummary, getAllActivities, getApprovalRequests, approveRequest,
  getGurus, createGuru, updateGuru, deleteGuru,
  getClasses, createClass, updateClass, deleteClass,
  getLessons, createLesson, updateLesson, deleteLesson,
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot,
  getCurriculums, createCurriculum, updateCurriculum, deleteCurriculum,
  getGradeLevels, createGradeLevel, updateGradeLevel, deleteGradeLevel,
  getSchedules, createOrUpdateSchedule, deleteSchedule, cloneSchedule, exportSchedule,
  exportReport, exportSnapshot, importSnapshot
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Middleware untuk semua route admin
router.use(verifyToken, isAdmin);

router.get('/summary', getDashboardSummary);
router.get('/activities', getAllActivities);
router.get('/requests', getApprovalRequests);
router.put('/requests/:id/approve', approveRequest);
router.get('/export-report', exportReport);

// Guru
router.get('/gurus', getGurus);
router.post('/gurus', createGuru);
router.put('/gurus/:id', updateGuru);
router.delete('/gurus/:id', deleteGuru);

// Kelas
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

// Pelajaran
router.get('/lessons', getLessons);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Tahun Ajaran
router.get('/academic-years', getAcademicYears);
router.post('/academic-years', createAcademicYear);
router.put('/academic-years/:id', updateAcademicYear);
router.delete('/academic-years/:id', deleteAcademicYear);

// Slot Jam Pelajaran
router.get('/time-slots', getTimeSlots);
router.post('/time-slots', createTimeSlot);
router.put('/time-slots/:id', updateTimeSlot);
router.delete('/time-slots/:id', deleteTimeSlot);

// Kurikulum
router.get('/curriculums', getCurriculums);
router.post('/curriculums', createCurriculum);
router.put('/curriculums/:id', updateCurriculum);
router.delete('/curriculums/:id', deleteCurriculum);

// Tingkat Kelas
router.get('/grade-levels', getGradeLevels);
router.post('/grade-levels', createGradeLevel);
router.put('/grade-levels/:id', updateGradeLevel);
router.delete('/grade-levels/:id', deleteGradeLevel);

// Jadwal
router.get('/schedules', getSchedules);
router.post('/schedules', createOrUpdateSchedule);
router.post('/schedules/clone', cloneSchedule);
router.get('/schedules/export', exportSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Developer Tools
router.get('/developer/export-snapshot', exportSnapshot);
router.post('/developer/import-snapshot', importSnapshot);

module.exports = router;
