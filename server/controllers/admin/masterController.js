const { User, Class, Lesson, Schedule, Activity, ApprovalRequest, AcademicYear, TimeSlot, Curriculum, GradeLevel } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// --- GURU CRUD ---
const getGurus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = { role: 'guru' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({ 
      where, 
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data guru' });
  }
};

const createGuru = async (req, res) => {
  try {
    const { name, username, password, isPhotoRequired } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const guru = await User.create({ 
      name, 
      username, 
      password: hashedPassword, 
      role: 'guru',
      isPhotoRequired: isPhotoRequired ?? true
    });
    res.json(guru);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah guru' });
  }
};

const updateGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, isPhotoRequired } = req.body;
    const data = { name, username, isPhotoRequired };
    if (password) data.password = await bcrypt.hash(password, 10);
    await User.update(data, { where: { id, role: 'guru' } });
    res.json({ message: 'Guru berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update guru' });
  }
};

const deleteGuru = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if guru is referenced in Schedule
    const hasSchedule = await Schedule.findOne({ where: { teacherId: id } });
    if (hasSchedule) {
      return res.status(400).json({ message: 'Guru tidak bisa dihapus karena terdaftar di jadwal pelajaran yang aktif.' });
    }
    // Check if guru is referenced in Activity (attendance logs)
    const hasActivity = await Activity.findOne({ where: { userId: id } });
    if (hasActivity) {
      return res.status(400).json({ message: 'Guru tidak bisa dihapus karena memiliki riwayat aktivitas absensi.' });
    }
    // Check if guru is referenced in ApprovalRequest
    const hasApproval = await ApprovalRequest.findOne({ where: { userId: id } });
    if (hasApproval) {
      return res.status(400).json({ message: 'Guru tidak bisa dihapus karena memiliki riwayat pengajuan izin/approval.' });
    }

    await User.destroy({ where: { id, role: 'guru' } });
    res.json({ message: 'Guru berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus guru' });
  }
};

// --- CLASS CRUD ---
const getClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Class.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: GradeLevel, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data kelas' });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, gradeLevelId } = req.body;
    const cls = await Class.create({ name, gradeLevelId });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kelas' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gradeLevelId } = req.body;
    await Class.update({ name, gradeLevelId }, { where: { id } });
    res.json({ message: 'Kelas berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kelas' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if class is referenced in Schedule
    const hasSchedule = await Schedule.findOne({ where: { classId: id } });
    if (hasSchedule) {
      return res.status(400).json({ message: 'Kelas tidak bisa dihapus karena terdaftar di jadwal pelajaran.' });
    }

    await Class.destroy({ where: { id } });
    res.json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus kelas' });
  }
};

// --- LESSON CRUD ---
const getLessons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Lesson.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelajaran' });
  }
};

const createLesson = async (req, res) => {
  try {
    const lsn = await Lesson.create(req.body);
    res.json(lsn);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah pelajaran' });
  }
};

const updateLesson = async (req, res) => {
  try {
    await Lesson.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Pelajaran berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update pelajaran' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if lesson is referenced in Curriculum
    const hasCurriculum = await Curriculum.findOne({ where: { lessonId: id } });
    if (hasCurriculum) {
      return res.status(400).json({ message: 'Pelajaran tidak bisa dihapus karena digunakan dalam kurikulum tingkat kelas.' });
    }
    // Check if lesson is referenced in Schedule
    const hasSchedule = await Schedule.findOne({ where: { lessonId: id } });
    if (hasSchedule) {
      return res.status(400).json({ message: 'Pelajaran tidak bisa dihapus karena terdaftar di jadwal pelajaran.' });
    }

    await Lesson.destroy({ where: { id } });
    res.json({ message: 'Pelajaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus pelajaran' });
  }
};

// --- ACADEMIC YEAR CRUD ---
const getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.findAll({ order: [['startDate', 'DESC']] });
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data tahun ajaran' });
  }
};

const createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await AcademicYear.update({ isActive: false }, { where: {} });
    }
    const year = await AcademicYear.create({ name, startDate, endDate, isActive });
    res.json(year);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah tahun ajaran' });
  }
};

const updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await AcademicYear.update({ isActive: false }, { where: { id: { [Op.ne]: id } } });
    }
    await AcademicYear.update({ name, startDate, endDate, isActive }, { where: { id } });
    res.json({ message: 'Tahun ajaran berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update tahun ajaran' });
  }
};

const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the academic year is active
    const year = await AcademicYear.findByPk(id);
    if (year && year.isActive) {
      return res.status(400).json({ message: 'Tahun ajaran aktif tidak bisa dihapus.' });
    }
    // Check if year is referenced in TimeSlot
    const hasTimeSlot = await TimeSlot.findOne({ where: { academicYearId: id } });
    if (hasTimeSlot) {
      return res.status(400).json({ message: 'Tahun ajaran tidak bisa dihapus karena memiliki data slot jam.' });
    }
    // Check if year is referenced in Schedule
    const hasSchedule = await Schedule.findOne({ where: { academicYearId: id } });
    if (hasSchedule) {
      return res.status(400).json({ message: 'Tahun ajaran tidak bisa dihapus karena memiliki data jadwal.' });
    }
    // Check if year is referenced in Curriculum
    const hasCurriculum = await Curriculum.findOne({ where: { academicYearId: id } });
    if (hasCurriculum) {
      return res.status(400).json({ message: 'Tahun ajaran tidak bisa dihapus karena memiliki data kurikulum.' });
    }
    // Check if year is referenced in Activity
    const hasActivity = await Activity.findOne({ where: { academicYearId: id } });
    if (hasActivity) {
      return res.status(400).json({ message: 'Tahun ajaran tidak bisa dihapus karena memiliki riwayat aktivitas absensi.' });
    }

    await AcademicYear.destroy({ where: { id } });
    res.json({ message: 'Tahun ajaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus tahun ajaran' });
  }
};

const toggleAcademicYearLock = async (req, res) => {
  try {
    const { id } = req.params;
    const year = await AcademicYear.findByPk(id);
    if (!year) {
      return res.status(404).json({ message: 'Tahun ajaran tidak ditemukan' });
    }
    const nextLocked = !year.isLocked;
    await AcademicYear.update({ isLocked: nextLocked }, { where: { id } });
    res.json({ 
      message: nextLocked ? 'Jadwal Tahun Ajaran berhasil DIKUNCI' : 'Jadwal Tahun Ajaran berhasil DIBUKA KUNCI', 
      isLocked: nextLocked 
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah status kunci tahun ajaran' });
  }
};

// --- TIME SLOT CRUD ---
const getTimeSlots = async (req, res) => {
  try {
    const { academicYearId, day } = req.query;
    const where = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (day) where.day = day;

    const slots = await TimeSlot.findAll({ 
      where, 
      order: [['day', 'ASC'], ['startTime', 'ASC']] 
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data slot jam' });
  }
};

const createTimeSlot = async (req, res) => {
  try {
    const slot = await TimeSlot.create(req.body);
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah slot jam' });
  }
};

const updateTimeSlot = async (req, res) => {
  try {
    await TimeSlot.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Slot jam berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update slot jam' });
  }
};

const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if time slot is referenced in Schedule
    const hasSchedule = await Schedule.findOne({ where: { timeSlotId: id } });
    if (hasSchedule) {
      return res.status(400).json({ message: 'Slot jam tidak bisa dihapus karena sudah digunakan dalam jadwal pelajaran.' });
    }

    await TimeSlot.destroy({ where: { id } });
    res.json({ message: 'Slot jam berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus slot jam' });
  }
};

// --- CURRICULUM CRUD ---
const getCurriculums = async (req, res) => {
  try {
    const { academicYearId, gradeLevelId } = req.query;
    const where = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;

    const curriculums = await Curriculum.findAll({
      where,
      include: [
        { model: Lesson, attributes: ['id', 'name'] },
        { model: AcademicYear, attributes: ['id', 'name'] },
        { model: GradeLevel, attributes: ['id', 'name'] }
      ],
      order: [[GradeLevel, 'sequence', 'ASC']]
    });
    res.json(curriculums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data kurikulum' });
  }
};

const createCurriculum = async (req, res) => {
  try {
    const { academicYearId, gradeLevelId, lessonId, requiredHours } = req.body;
    
    // Check if mapping already exists
    const existing = await Curriculum.findOne({
      where: { academicYearId, gradeLevelId, lessonId }
    });
    if (existing) return res.status(400).json({ message: 'Mapel sudah terdaftar di kurikulum tingkat ini' });

    const curriculum = await Curriculum.create({ academicYearId, gradeLevelId, lessonId, requiredHours });
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kurikulum' });
  }
};

const updateCurriculum = async (req, res) => {
  try {
    const { id } = req.params;
    const { requiredHours } = req.body;
    await Curriculum.update({ requiredHours }, { where: { id } });
    res.json({ message: 'Kurikulum berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kurikulum' });
  }
};

const deleteCurriculum = async (req, res) => {
  try {
    const { id } = req.params;
    const curr = await Curriculum.findByPk(id);
    if (curr) {
      // Find classes for this gradeLevel
      const classesInGrade = await Class.findAll({ where: { gradeLevelId: curr.gradeLevelId } });
      const classIds = classesInGrade.map(c => c.id);
      
      const hasSchedule = await Schedule.findOne({
        where: {
          academicYearId: curr.academicYearId,
          lessonId: curr.lessonId,
          classId: classIds
        }
      });
      if (hasSchedule) {
        return res.status(400).json({ message: 'Kurikulum tidak bisa dihapus karena ada jadwal pelajaran aktif yang menggunakan mapel ini.' });
      }
    }

    await Curriculum.destroy({ where: { id } });
    res.json({ message: 'Kurikulum berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus kurikulum' });
  }
};

// --- GRADE LEVEL CRUD ---
const getGradeLevels = async (req, res) => {
  try {
    const grades = await GradeLevel.findAll({ order: [['sequence', 'ASC']] });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data tingkat kelas' });
  }
};

const createGradeLevel = async (req, res) => {
  try {
    const grade = await GradeLevel.create(req.body);
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah tingkat kelas' });
  }
};

const updateGradeLevel = async (req, res) => {
  try {
    await GradeLevel.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Tingkat kelas berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update tingkat kelas' });
  }
};

const deleteGradeLevel = async (req, res) => {
  try {
    await GradeLevel.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Tingkat kelas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus tingkat kelas' });
  }
};

module.exports = {
  getGurus, createGuru, updateGuru, deleteGuru,
  getClasses, createClass, updateClass, deleteClass,
  getLessons, createLesson, updateLesson, deleteLesson,
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear, toggleAcademicYearLock,
  getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot,
  getCurriculums, createCurriculum, updateCurriculum, deleteCurriculum,
  getGradeLevels, createGradeLevel, updateGradeLevel, deleteGradeLevel
};
