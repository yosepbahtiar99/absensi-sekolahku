const express = require('express');
const router = express.Router();
const { 
  getDashboardSummary, getAllActivities,
  getGurus, createGuru, updateGuru, deleteGuru,
  getClasses, createClass, updateClass, deleteClass,
  getLessons, createLesson, updateLesson, deleteLesson
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Middleware untuk semua route admin
router.use(verifyToken, isAdmin);

router.get('/summary', getDashboardSummary);
router.get('/activities', getAllActivities);

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

module.exports = router;
