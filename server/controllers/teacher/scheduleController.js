const { Schedule, Class, Lesson, Activity, AcademicYear, TimeSlot, User } = require('../../models');
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

    // Fetch teacher schedules for the day
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

    // Fetch all time slots for the day
    const timeSlots = await TimeSlot.findAll({
      where: {
        day: selectedDay,
        academicYearId: activeYear.id
      },
      order: [['startTime', 'ASC']]
    });

    const matchedScheduleIds = new Set();

    const result = timeSlots.map(ts => {
      // Find a schedule matching this timeSlot id or matching startTime
      const scheduleForSlot = schedules.find(s => 
        s.timeSlotId === ts.id || 
        (s.startTime && s.startTime.substring(0, 5) === ts.startTime.substring(0, 5))
      );

      if (scheduleForSlot) {
        matchedScheduleIds.add(scheduleForSlot.id);
        const data = scheduleForSlot.toJSON();
        const startTime = data.TimeSlot?.startTime || data.startTime || ts.startTime;
        const endTime = data.TimeSlot?.endTime || data.endTime || ts.endTime;
        const Attendance = data.Activities && data.Activities.length > 0 ? data.Activities[0] : null;
        
        return {
          ...data,
          startTime,
          endTime,
          Attendance,
          Activities: undefined,
          isBreak: false
        };
      } else {
        return {
          id: `break-${ts.id}`,
          day: selectedDay,
          startTime: ts.startTime,
          endTime: ts.endTime,
          academicYearId: activeYear.id,
          timeSlotId: ts.id,
          TimeSlot: {
            label: ts.label,
            startTime: ts.startTime,
            endTime: ts.endTime
          },
          isBreak: true,
          Lesson: null,
          Class: null,
          Attendance: null
        };
      }
    });

    // Append any schedules that were not matched to any TimeSlot
    const unmatchedSchedules = schedules.filter(s => !matchedScheduleIds.has(s.id));
    const unmatchedResult = unmatchedSchedules.map(s => {
      const data = s.toJSON();
      const startTime = data.TimeSlot?.startTime || data.startTime;
      const endTime = data.TimeSlot?.endTime || data.endTime;
      const Attendance = data.Activities && data.Activities.length > 0 ? data.Activities[0] : null;
      
      return {
        ...data,
        startTime,
        endTime,
        Attendance,
        Activities: undefined,
        isBreak: false
      };
    });

    const finalResult = [...result, ...unmatchedResult].sort((a, b) => 
      (a.startTime || '').localeCompare(b.startTime || '')
    );

    res.json(finalResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil jadwal' });
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

module.exports = {
  getJakartaDayInfo,
  getMySchedule,
  getScheduleDetail
};
