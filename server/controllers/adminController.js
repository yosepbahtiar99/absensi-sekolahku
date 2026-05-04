const { User, Class, Lesson, Schedule, Activity, ApprovalRequest, AcademicYear, TimeSlot } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');

const getDashboardSummary = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    let targetYearId = academicYearId;

    if (!targetYearId) {
      const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
      targetYearId = activeYear?.id;
    }

    const yearWhere = targetYearId ? { academicYearId: targetYearId } : {};

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
    await AcademicYear.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Tahun ajaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus tahun ajaran' });
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
    await TimeSlot.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Slot jam berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus slot jam' });
  }
};

// --- SCHEDULE CRUD & LOGIC ---
const getSchedules = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    const where = {};
    if (academicYearId) where.academicYearId = academicYearId;

    const schedules = await Schedule.findAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name'] },
        { model: Class, attributes: ['id', 'name'] },
        { model: Lesson, attributes: ['id', 'name'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] }
      ],
      order: [['day', 'ASC']]
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data jadwal' });
  }
};

const createOrUpdateSchedule = async (req, res) => {
  try {
    const { id, day, academicYearId, timeSlotId, teacherId, classId, lessonId } = req.body;

    // 1. Validasi Overlap Guru
    const teacherConflict = await Schedule.findOne({
      where: {
        day,
        academicYearId,
        timeSlotId,
        teacherId,
        id: { [Op.ne]: id || 0 }
      }
    });
    if (teacherConflict) return res.status(400).json({ message: 'Guru sudah ada jadwal lain di slot jam tersebut' });

    // 2. Validasi Overlap Kelas
    const classConflict = await Schedule.findOne({
      where: {
        day,
        academicYearId,
        timeSlotId,
        classId,
        id: { [Op.ne]: id || 0 }
      }
    });
    if (classConflict) return res.status(400).json({ message: 'Kelas sudah ada pelajaran lain di slot jam tersebut' });

    const data = { day, academicYearId, timeSlotId, teacherId, classId, lessonId };

    if (id) {
      await Schedule.update(data, { where: { id } });
      res.json({ message: 'Jadwal berhasil diupdate' });
    } else {
      const newSchedule = await Schedule.create(data);
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

const cloneSchedule = async (req, res) => {
  try {
    const { fromYearId, toYearId } = req.body;

    if (!fromYearId || !toYearId) {
      return res.status(400).json({ message: 'Pilih tahun asal dan tujuan' });
    }

    // 1. Ambil semua jadwal dari tahun asal
    const oldSchedules = await Schedule.findAll({
      where: { academicYearId: fromYearId },
      include: [{ model: TimeSlot }]
    });

    if (oldSchedules.length === 0) {
      return res.status(404).json({ message: 'Tidak ada jadwal di tahun asal' });
    }

    // 2. Ambil semua time slots di tahun tujuan
    const newTimeSlots = await TimeSlot.findAll({
      where: { academicYearId: toYearId }
    });

    // 3. Mapping logic
    const newSchedules = [];
    for (const oldSched of oldSchedules) {
      // Cari slot yang cocok (berdasarkan hari dan nomor periode/label)
      const matchingSlot = newTimeSlots.find(ts => 
        ts.day === oldSched.day && 
        (ts.periodNumber === oldSched.TimeSlot?.periodNumber || ts.label === oldSched.TimeSlot?.label)
      );

      if (matchingSlot) {
        newSchedules.push({
          classId: oldSched.classId,
          lessonId: oldSched.lessonId,
          teacherId: oldSched.teacherId,
          academicYearId: toYearId,
          timeSlotId: matchingSlot.id,
          day: oldSched.day
        });
      }
    }

    if (newSchedules.length === 0) {
      return res.status(400).json({ message: 'Struktur jam pelajaran di tahun tujuan tidak cocok' });
    }

    // 4. Bulk Create (Skip if duplicate? Better to clear or let it be)
    // Clear existing schedules in toYearId first to avoid messy duplicates?
    // User choice would be better, but for now let's just create.
    await Schedule.bulkCreate(newSchedules);

    res.json({ message: `Berhasil meng-copy ${newSchedules.length} jadwal` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal meng-cloning jadwal' });
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
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot,
  getSchedules, createOrUpdateSchedule, deleteSchedule,
  cloneSchedule,
  exportReport
};
