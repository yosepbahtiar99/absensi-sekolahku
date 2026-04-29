const { Schedule, Class, Lesson, Activity } = require('../models');
const { Op } = require('sequelize');

const getMySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayName = days[new Date().getDay()];

    const schedules = await Schedule.findAll({
      where: {
        teacherId,
        day: todayName
      },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] },
        { 
          model: Activity, 
          where: { 
            timestamp: {
              [Op.gte]: new Date().setHours(0,0,0,0),
              [Op.lte]: new Date().setHours(23,59,59,999)
            }
          },
          required: false 
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil jadwal' });
  }
};

const submitAttendance = async (req, res) => {
  try {
    const { scheduleId, photoSelfie, photoClass, type, isCustom } = req.body;
    const userId = req.user.id;

    // Ambil info jadwal buat cek telat
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    // Logika Telat (Toleransi 15 Menit)
    const now = new Date();
    const [sH, sM] = schedule.startTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(sH, sM, 0);

    const diffInMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
    
    let status = 'masuk';
    if (diffInMinutes > 15) {
      status = 'telat';
    }

    const activity = await Activity.create({
      scheduleId,
      userId,
      photoSelfie,
      photoClass,
      type: type || 'pembelajaran',
      isCustom: isCustom || false,
      status,
      timestamp: now
    });

    res.json({ message: 'Absensi berhasil disimpan', activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal simpan absensi' });
  }
};

module.exports = { getMySchedule, submitAttendance };
