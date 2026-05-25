const { User, Class, Lesson, Schedule, Activity, ApprovalRequest, AcademicYear, TimeSlot, SystemSetting, DailyAttendance } = require('../../models');
const { Op } = require('sequelize');
const { getJakartaDayInfo } = require('../teacher/scheduleController');

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

const getDailyPresence = async (req, res) => {
  try {
    const { start, end } = getJakartaDayInfo();
    
    const activities = await Activity.findAll({
      where: {
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        },
        status: { [Op.in]: ['masuk', 'telat'] },
        isApproveCheckOut: false
      },
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    const teacherMap = {};
    activities.forEach(act => {
      if (!teacherMap[act.userId]) {
        teacherMap[act.userId] = {
          userId: act.userId,
          name: act.User?.name || 'Unknown',
          firstCheckIn: act.timestamp,
          activityIds: []
        };
      }
      if (new Date(act.timestamp) < new Date(teacherMap[act.userId].firstCheckIn)) {
        teacherMap[act.userId].firstCheckIn = act.timestamp;
      }
      teacherMap[act.userId].activityIds.push(act.id);
    });

    res.json({ data: Object.values(teacherMap) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data kehadiran harian' });
  }
};

const approveClockOut = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = getJakartaDayInfo();

    await Activity.update({
      isApproveCheckOut: true,
      clockOutTime: new Date()
    }, {
      where: {
        userId,
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        },
        status: { [Op.in]: ['masuk', 'telat'] },
        isApproveCheckOut: false
      }
    });

    res.json({ message: 'Clock out berhasil disetujui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyetujui clock out' });
  }
};

const manualActivity = async (req, res) => {
  try {
    const { scheduleId, teacherId, status, description, date } = req.body;

    const start = new Date(`${date}T00:00:00+07:00`);
    const end = new Date(`${date}T23:59:59+07:00`);

    const existingActivity = await Activity.findOne({
      where: {
        scheduleId,
        userId: teacherId,
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    const schedule = await Schedule.findByPk(scheduleId, {
      include: [{ model: Class }, { model: Lesson }, { model: TimeSlot }]
    });

    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    let timeStr = schedule.TimeSlot?.startTime || '07:00:00';

    if (status === 'telat') {
      const setting = await SystemSetting.findOne({ where: { key: 'late_threshold' } });
      const threshold = setting ? parseInt(setting.value, 10) : 15;
      const timeParts = timeStr.split(':');
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10) + threshold;
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    }

    const targetTimestamp = new Date(`${date}T${timeStr}+07:00`);

    if (status === 'alpa') {
      if (existingActivity) {
        await existingActivity.destroy();
      }
      return res.json({ message: 'Aktivitas dihapus (diset Alpa)' });
    }

    const flowSetting = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const attendanceFlow = flowSetting ? flowSetting.value : 'strict';

    let dailyAttendanceId = null;
    if (attendanceFlow === 'full_day') {
      const daily = await DailyAttendance.findOne({
        where: { userId: teacherId, date }
      });
      
      if (!daily && status !== 'alpa') {
        return res.status(400).json({ message: 'Guru belum melakukan Check In harian. Silakan klik "+ Set Hadir Manual" di bawah nama guru terlebih dahulu.' });
      }
      if (daily) {
        dailyAttendanceId = daily.id;
      }
    }

    if (existingActivity) {
      await existingActivity.update({
        status,
        timestamp: targetTimestamp,
        description: description || existingActivity.description,
        isApproveCheckOut: true,
        dailyAttendanceId: dailyAttendanceId || existingActivity.dailyAttendanceId
      });
      return res.json({ message: `Aktivitas berhasil diupdate menjadi ${status}` });
    } else {
      const activeYear = await AcademicYear.findOne({ where: { isActive: true } });

      await Activity.create({
        userId: teacherId,
        scheduleId,
        academicYearId: activeYear?.id,
        type: 'pembelajaran',
        status,
        description: description || 'Diabsen manual oleh Admin',
        timestamp: targetTimestamp,
        snapshotClassName: schedule.Class?.name,
        snapshotLessonName: schedule.Lesson?.name,
        snapshotTeacherName: (await User.findByPk(teacherId))?.name,
        isApproveCheckOut: true,
        dailyAttendanceId
      });

      return res.json({ message: `Aktivitas berhasil ditambahkan sebagai ${status}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memproses absensi manual' });
  }
};

module.exports = {
  getApprovalRequests,
  approveRequest,
  getDailyPresence,
  approveClockOut,
  manualActivity
};
