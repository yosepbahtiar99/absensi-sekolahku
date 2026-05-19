const { User, Schedule, Class, Lesson, Activity, ApprovalRequest, AcademicYear, TimeSlot } = require('../models');
const { Op } = require('sequelize');

// Timezone Helper: Get current day name and date bounds in Asia/Jakarta (WIB)
const getJakartaDayInfo = () => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const weekday = parts.find(p => p.type === 'weekday').value.toLowerCase();

  // Mapping weekday to Indonesian
  const dayMap = {
    sunday: 'minggu',
    monday: 'senin',
    tuesday: 'selasa',
    wednesday: 'rabu',
    thursday: 'kamis',
    friday: 'jumat',
    saturday: 'sabtu'
  };
  const todayName = dayMap[weekday] || 'senin';

  // Construct absolute UTC dates for 00:00:00 WIB and 23:59:59 WIB
  const start = new Date(`${year}-${month}-${day}T00:00:00+07:00`);
  const end = new Date(`${year}-${month}-${day}T23:59:59+07:00`);

  return { year, month, day, todayName, start, end };
};

const getMySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { day } = req.query; 
    const { todayName, start, end } = getJakartaDayInfo();
    const selectedDay = day || todayName;

    // Get Active Academic Year
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.json([]);

    const schedules = await Schedule.findAll({
      where: {
        teacherId,
        day: selectedDay,
        academicYearId: activeYear.id
      },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name', 'hours'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] },
        { 
          model: Activity, 
          where: { 
            timestamp: {
              [Op.gte]: start,
              [Op.lte]: end
            }
          },
          required: false 
        }
      ]
    });

    const result = schedules.map(s => {
      const data = s.toJSON();
      // Use time from TimeSlot if available
      const startTime = data.TimeSlot?.startTime || data.startTime;
      const endTime = data.TimeSlot?.endTime || data.endTime;
      
      const Attendance = data.Activities && data.Activities.length > 0 ? data.Activities[0] : null;
      
      return {
        ...data,
        startTime,
        endTime,
        Attendance,
        Activities: undefined
      };
    }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil jadwal' });
  }
};

const submitAttendance = async (req, res) => {
  try {
    const { scheduleId, photoSelfie, photoClass, type, isCustom } = req.body;
    const userId = req.user.id;

    // Ambil info jadwal buat cek telat & snapshot
    const schedule = await Schedule.findByPk(scheduleId, {
      include: [
        { model: Class },
        { model: Lesson },
        { model: User, as: 'teacher' },
        { model: TimeSlot }
      ]
    });

    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    // Cek apakah sudah absen hari ini
    const { year, month, day: dayStr, start, end } = getJakartaDayInfo();
    const existingActivity = await Activity.findOne({
      where: {
        scheduleId,
        userId,
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    if (existingActivity) {
      return res.status(400).json({ message: 'Anda sudah melakukan absensi untuk jadwal ini hari ini' });
    }

    // Ambil jam dari TimeSlot (Prioritas) atau fallback ke manual Schedule (Backward Compatibility)
    const effectiveStartTime = schedule.TimeSlot ? schedule.TimeSlot.startTime : schedule.startTime;
    const effectiveEndTime = schedule.TimeSlot ? schedule.TimeSlot.endTime : schedule.endTime;

    if (!effectiveStartTime || !effectiveEndTime) {
      return res.status(400).json({ message: 'Jam pelaksanaan tidak terdefinisi' });
    }

    // Logika Telat (Toleransi 15 Menit)
    // Cek keterlambatan
    const scheduleStartTime = schedule.TimeSlot?.startTime || schedule.startTime;
    const scheduleEndTime = schedule.TimeSlot?.endTime || schedule.endTime;
    
    if (!scheduleStartTime || !scheduleEndTime) {
      return res.status(400).json({ message: 'Jam pelaksanaan tidak terdefinisi' });
    }

    const startTimeDate = new Date(`${year}-${month}-${dayStr}T${scheduleStartTime}+07:00`);
    const endTimeDate = new Date(`${year}-${month}-${dayStr}T${scheduleEndTime}+07:00`);
    const now = new Date();

    if (now < startTimeDate) {
      return res.status(400).json({ message: 'Jadwal belum dimulai bro!' });
    }

    if (now > endTimeDate) {
      return res.status(400).json({ message: 'Jadwal sudah berakhir bro!' });
    }

    let status = 'masuk';
    const diffInMinutes = (now.getTime() - startTimeDate.getTime()) / (1000 * 60);
    if (diffInMinutes > 15) status = 'telat';

    const activity = await Activity.create({
      userId,
      scheduleId,
      academicYearId: schedule.academicYearId,
      photoSelfie,
      photoClass,
      status,
      type: type || 'pembelajaran',
      isCustom: isCustom || false,
      timestamp: now,
      // Snapshot data
      snapshotClassName: schedule.Class?.name || 'Unknown Class',
      snapshotLessonName: schedule.Lesson?.name || 'Unknown Lesson',
      snapshotTeacherName: (await User.findByPk(userId))?.name || 'Unknown Teacher'
    });

    res.json({ message: 'Absensi berhasil disimpan', activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal simpan absensi' });
  }
};

const getScheduleDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = getJakartaDayInfo();
    const scheduleData = await Schedule.findByPk(id, {
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['isPhotoRequired'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] },
        { 
          model: Activity,
          where: {
            timestamp: {
              [Op.gte]: start,
              [Op.lte]: end
            }
          },
          required: false
        }
      ]
    });

    if (!scheduleData) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    const schedule = scheduleData.toJSON();
    
    // Map effective times
    schedule.startTime = schedule.TimeSlot?.startTime || schedule.startTime;
    schedule.endTime = schedule.TimeSlot?.endTime || schedule.endTime;
    
    schedule.Attendance = schedule.Activities && schedule.Activities.length > 0 ? schedule.Activities[0] : null;
    delete schedule.Activities;

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil detail jadwal' });
  }
};

const getMyActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const { count, rows } = await Activity.findAndCountAll({
      where: { userId },
      include: [
        { 
          model: Schedule, 
          include: [
            { model: Class, attributes: ['name'] },
            { model: Lesson, attributes: ['name'] }
          ]
        }
      ],
      limit,
      offset,
      order: [['timestamp', 'DESC']]
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
    res.status(500).json({ message: 'Gagal mengambil riwayat aktivitas' });
  }
};

const createApprovalRequest = async (req, res) => {
  try {
    const { type, activityId, data } = req.body;
    const userId = req.user.id;

    const request = await ApprovalRequest.create({
      type,
      userId,
      activityId,
      data,
      status: 'pending'
    });

    res.json({ message: 'Pengajuan berhasil dikirim', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengirim pengajuan' });
  }
};

const getMyApprovalRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await ApprovalRequest.findAndCountAll({
      where: { userId },
      include: [
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

module.exports = { getMySchedule, submitAttendance, getScheduleDetail, getMyActivities, createApprovalRequest, getMyApprovalRequests };
