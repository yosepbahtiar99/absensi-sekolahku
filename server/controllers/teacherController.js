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

    const result = schedules.map(s => {
      const schedule = s.toJSON();
      // Map Activities array to a single Attendance object to match frontend interface
      schedule.Attendance = schedule.Activities && schedule.Activities.length > 0 ? schedule.Activities[0] : null;
      delete schedule.Activities;
      return schedule;
    });

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

    // Ambil info jadwal buat cek telat
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    // Cek apakah sudah absen hari ini
    const existingActivity = await Activity.findOne({
      where: {
        scheduleId,
        userId,
        timestamp: {
          [Op.gte]: new Date().setHours(0,0,0,0),
          [Op.lte]: new Date().setHours(23,59,59,999)
        }
      }
    });

    if (existingActivity) {
      return res.status(400).json({ message: 'Anda sudah melakukan absensi untuk jadwal ini hari ini' });
    }

    // Logika Telat (Toleransi 15 Menit)
    const now = new Date();
    const [sH, sM] = schedule.startTime.split(':').map(Number);
    const [eH, eM] = schedule.endTime.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(sH, sM, 0);
    
    const endTime = new Date();
    endTime.setHours(eH, eM, 0);

    // Validasi apakah jadwal sudah mulai atau sudah selesai
    if (now < startTime) {
      return res.status(400).json({ message: 'Jadwal belum dimulai bro!' });
    }

    if (now > endTime) {
      return res.status(400).json({ message: 'Jadwal sudah berakhir bro!' });
    }

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

const getScheduleDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id, {
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] }
      ]
    });
    if (!schedule) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil detail jadwal' });
  }
};

module.exports = { getMySchedule, submitAttendance, getScheduleDetail };
