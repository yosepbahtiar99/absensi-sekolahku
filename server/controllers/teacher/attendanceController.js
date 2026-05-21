const { Schedule, Class, Lesson, Activity, User, TimeSlot, SystemSetting } = require('../../models');
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

    // Fetch late tolerance setting
    const lateSettingObj = await SystemSetting.findOne({ where: { key: 'late_tolerance' } });
    const lateTolerance = lateSettingObj ? parseInt(lateSettingObj.value, 10) : 15;

    let status = 'masuk';
    const diffInMinutes = (now.getTime() - startTimeDate.getTime()) / (1000 * 60);
    if (diffInMinutes > lateTolerance) status = 'telat';

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

    // Auto-Inheritance Logic
    const flowSettingObj = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const flowSetting = flowSettingObj ? flowSettingObj.value : 'disabled';

    if (flowSetting !== 'disabled' && !isCustom && type !== 'tidak_hadir') {
      const dayMap = {
        sunday: 'minggu',
        monday: 'senin',
        tuesday: 'selasa',
        wednesday: 'rabu',
        thursday: 'kamis',
        friday: 'jumat',
        saturday: 'sabtu'
      };
      const weekdayName = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long'
      }).format(now).toLowerCase();
      const todayName = dayMap[weekdayName] || 'senin';

      const whereClause = {
        teacherId: userId,
        day: todayName,
        academicYearId: schedule.academicYearId,
        id: { [Op.ne]: scheduleId }
      };

      if (flowSetting !== 'full_day') {
        whereClause.classId = schedule.classId;
        whereClause.lessonId = schedule.lessonId;
      }

      const sameSchedules = await Schedule.findAll({
        where: whereClause,
        include: [
          { model: TimeSlot },
          { model: Class },
          { model: Lesson }
        ]
      });

      if (sameSchedules.length > 0) {
        const getStartTime = (s) => s.TimeSlot?.startTime || s.startTime || '00:00:00';
        const getPeriod = (s) => s.TimeSlot?.periodNumber ?? 0;

        const currentStart = getStartTime(schedule);
        const currentPeriod = getPeriod(schedule);

        // Filter schedules starting AFTER the current schedule
        const futureSchedules = sameSchedules.filter(s => getStartTime(s) > currentStart);

        if (futureSchedules.length > 0) {
          futureSchedules.sort((a, b) => getStartTime(a).localeCompare(getStartTime(b)));

          let inheritSchedules = [];

          if (flowSetting === 'block' || flowSetting === 'full_day') {
            inheritSchedules = futureSchedules;
          } else if (flowSetting === 'strict') {
            let lastPeriod = currentPeriod;
            for (const nextSched of futureSchedules) {
              const nextPeriod = getPeriod(nextSched);
              if (nextPeriod === lastPeriod + 1) {
                inheritSchedules.push(nextSched);
                lastPeriod = nextPeriod;
              } else {
                break;
              }
            }
          }

          // Create activity records for inherited schedules
          for (const nextSched of inheritSchedules) {
            const hasActivity = await Activity.findOne({
              where: {
                scheduleId: nextSched.id,
                userId,
                timestamp: {
                  [Op.gte]: start,
                  [Op.lte]: end
                }
              }
            });

            if (!hasActivity) {
              await Activity.create({
                userId,
                scheduleId: nextSched.id,
                academicYearId: nextSched.academicYearId,
                photoSelfie,
                photoClass,
                status,
                type: type || 'pembelajaran',
                isCustom: false,
                timestamp: now,
                snapshotClassName: nextSched.Class?.name || schedule.Class?.name || 'Unknown Class',
                snapshotLessonName: nextSched.Lesson?.name || schedule.Lesson?.name || 'Unknown Lesson',
                snapshotTeacherName: activity.snapshotTeacherName
              });
            }
          }
        }
      }
    }

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
