const { Schedule, Class, Lesson, Activity, User, TimeSlot } = require('../../models');
const { Op } = require('sequelize');
const { getJakartaDayInfo } = require('./scheduleController');

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

module.exports = {
  submitAttendance,
  getMyActivities
};
