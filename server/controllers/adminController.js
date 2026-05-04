const { User, Class, Lesson, Schedule, Activity, ApprovalRequest } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');

const getDashboardSummary = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const yearWhere = activeYear ? { academicYearId: activeYear.id } : {};

    const totalGuru = await User.count({ where: { role: 'guru' } });
    const totalKelas = await Class.count();
    const totalPelajaran = await Lesson.count();

    const today = new Date().setHours(0,0,0,0);
    const totalHadir = await Activity.count({
      where: {
        ...yearWhere,
        timestamp: { [Op.gte]: today },
        status: 'masuk'
      }
    });
    
    const totalTelat = await Activity.count({
      where: {
        ...yearWhere,
        timestamp: { [Op.gte]: today },
        status: 'telat'
      }
    });

    res.json({
      totalGuru,
      totalKelas,
      totalPelajaran,
      activeYear: activeYear?.name,
      todayStats: {
        hadir: totalHadir,
        telat: totalTelat
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard' });
  }
};

const getAllActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, teacherId, classId, lessonId, startDate, endDate, status, academicYearId } = req.query;

    const where = {};
    if (teacherId) where.userId = teacherId;
    if (status) where.status = status;
    if (academicYearId) where.academicYearId = academicYearId;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp[Op.lte] = end;
      }
    }

    if (search) {
      where[Op.or] = [
        { '$User.name$': { [Op.like]: `%${search}%` } },
        { '$Schedule.Lesson.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const scheduleWhere = {};
    if (lessonId) scheduleWhere.lessonId = lessonId;
    if (classId) scheduleWhere.classId = classId;

    const { count, rows } = await Activity.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['name'] },
        { 
          model: Schedule, 
          where: Object.keys(scheduleWhere).length ? scheduleWhere : null,
          include: [
            { model: Class, attributes: ['name'] },
            { model: Lesson, attributes: ['name'] }
          ]
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']],
      distinct: true
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
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data aktivitas' });
  }
};

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
    const { name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const guru = await User.create({ name, username, password: hashedPassword, role: 'guru' });
    res.json(guru);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah guru' });
  }
};

const updateGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password } = req.body;
    const data = { name, username };
    if (password) data.password = await bcrypt.hash(password, 10);
    await User.update(data, { where: { id, role: 'guru' } });
    res.json({ message: 'Guru berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update guru' });
  }
};

const deleteGuru = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id, role: 'guru' } });
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
    const cls = await Class.create(req.body);
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kelas' });
  }
};

const updateClass = async (req, res) => {
  try {
    await Class.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Kelas berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kelas' });
  }
};

const deleteClass = async (req, res) => {
  try {
    await Class.destroy({ where: { id: req.params.id } });
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
    await Lesson.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Pelajaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus pelajaran' });
  }
};

// --- SCHEDULE CRUD & LOGIC ---
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name'] },
        { model: Class, attributes: ['id', 'name'] },
        { model: Lesson, attributes: ['id', 'name'] }
      ],
      order: [['startTime', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data jadwal' });
  }
};

const createOrUpdateSchedule = async (req, res) => {
  try {
    const { id, day, startTime, endTime, teacherId, classId, lessonId } = req.body;

    // 1. Validasi Overlap Guru
    const teacherConflict = await Schedule.findOne({
      where: {
        day,
        teacherId,
        id: { [Op.ne]: id || 0 },
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime] } },
          { endTime: { [Op.between]: [startTime, endTime] } },
          { [Op.and]: [{ startTime: { [Op.lte]: startTime } }, { endTime: { [Op.gte]: endTime } }] }
        ]
      }
    });
    if (teacherConflict) return res.status(400).json({ message: 'Guru sudah ada jadwal lain di jam tersebut' });

    // 2. Validasi Overlap Kelas
    const classConflict = await Schedule.findOne({
      where: {
        day,
        classId,
        id: { [Op.ne]: id || 0 },
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime] } },
          { endTime: { [Op.between]: [startTime, endTime] } },
          { [Op.and]: [{ startTime: { [Op.lte]: startTime } }, { endTime: { [Op.gte]: endTime } }] }
        ]
      }
    });
    if (classConflict) return res.status(400).json({ message: 'Kelas sudah ada pelajaran lain di jam tersebut' });

    if (id) {
      await Schedule.update({ day, startTime, endTime, teacherId, classId, lessonId }, { where: { id } });
      res.json({ message: 'Jadwal berhasil diupdate' });
    } else {
      const newSchedule = await Schedule.create({ day, startTime, endTime, teacherId, classId, lessonId });
      res.json(newSchedule);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal simpan jadwal' });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await Schedule.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus jadwal' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { teacherId, lessonId, classId, startDate, endDate, status, academicYearId } = req.query;

    const where = {};
    if (teacherId) where.userId = teacherId;
    if (status) where.status = status;
    if (academicYearId) where.academicYearId = academicYearId;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp[Op.lte] = end;
      }
    }

    const scheduleWhere = {};
    if (lessonId) scheduleWhere.lessonId = lessonId;
    if (classId) scheduleWhere.classId = classId;

    const activities = await Activity.findAll({
      where,
      include: [
        { model: User, attributes: ['name'] },
        { 
          model: Schedule,
          where: Object.keys(scheduleWhere).length ? scheduleWhere : null,
          include: [
            { model: Class, attributes: ['name'] },
            { model: Lesson, attributes: ['name'] }
          ]
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Absensi');

    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Waktu', key: 'time', width: 10 },
      { header: 'Nama Guru', key: 'teacher', width: 25 },
      { header: 'Mata Pelajaran', key: 'lesson', width: 25 },
      { header: 'Kelas', key: 'class', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0891B2' } // Primary Cyan-600
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    activities.forEach((act, index) => {
      worksheet.addRow({
        no: index + 1,
        date: new Date(act.timestamp).toLocaleDateString('id-ID'),
        time: new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        teacher: act.snapshotTeacherName || act.User?.name || 'Unknown',
        lesson: act.snapshotLessonName || act.Schedule?.Lesson?.name || 'Custom/Lembur',
        class: act.snapshotClassName || act.Schedule?.Class?.name || '-',
        status: act.status.toUpperCase(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_Absensi.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ekspor laporan' });
  }
};

const getApprovalRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, type } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows } = await ApprovalRequest.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['name'] },
        { 
          model: Activity, 
          include: [
            { 
              model: Schedule,
              include: [
                { model: Class, attributes: ['name'] },
                { model: Lesson, attributes: ['name'] }
              ]
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body; // 'approved' or 'rejected'
    const adminId = req.user.id;

    const request = await ApprovalRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });

    if (status === 'approved') {
      const payload = request.data;
      const activeYear = await AcademicYear.findOne({ where: { isActive: true } });

      if (request.type === 'koreksi') {
        // Update activity timestamp
        await Activity.update(
          { timestamp: payload.requestedTimestamp },
          { where: { id: request.activityId } }
        );
      } else if (request.type === 'custom_pembelajaran') {
        // Create new activity for custom lesson
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'pembelajaran custom',
          isCustom: true,
          photoSelfie: payload.photoSelfie,
          photoClass: payload.photoClass,
          timestamp: new Date(),
          status: 'masuk', // Custom biasanya dianggap hadir
          snapshotLessonName: payload.subject || 'Custom Lesson',
          snapshotClassName: payload.class || 'Custom Class',
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      } else if (request.type === 'perizinan') {
        // Create activity as 'tidak_hadir'
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'pembelajaran',
          status: 'tidak_hadir',
          timestamp: new Date(),
          description: `Izin: ${payload.absenceType}. Catatan: ${payload.reason}`,
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      } else if (request.type === 'lembur') {
        // Create activity as 'lembur'
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'lembur',
          timestamp: new Date(),
          description: payload.reason,
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      }
    }

    await ApprovalRequest.update({
      status,
      adminNote,
      approvedAt: new Date(),
      approvedBy: adminId
    }, { where: { id } });

    res.json({ message: `Pengajuan berhasil di-${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memproses approval' });
  }
};

module.exports = { 
  getDashboardSummary, 
  getAllActivities,
  getApprovalRequests,
  approveRequest,
  getGurus, createGuru, updateGuru, deleteGuru,
  getClasses, createClass, updateClass, deleteClass,
  getLessons, createLesson, updateLesson, deleteLesson,
  getSchedules, createOrUpdateSchedule, deleteSchedule,
  exportReport
};
