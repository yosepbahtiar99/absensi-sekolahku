const { Schedule, Class, Lesson, Activity, ApprovalRequest } = require('../models');
const { Op } = require('sequelize');

const getMySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { day } = req.query; // Ambil parameter day dari query
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayName = days[new Date().getDay()];
    
    // Gunakan day dari query jika ada, jika tidak gunakan hari ini
    const selectedDay = day || todayName;

    const schedules = await Schedule.findAll({
      where: {
        teacherId,
        day: selectedDay
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
    const scheduleData = await Schedule.findByPk(id, {
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
      ]
    });

    if (!scheduleData) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });

    const schedule = scheduleData.toJSON();
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
