const { User, Class, Lesson, Schedule, Activity, AcademicYear, TimeSlot, GradeLevel, Curriculum, ApprovalRequest, SystemSetting, sequelize } = require('../../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

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
            { 
              model: Class, 
              attributes: ['name'],
              include: [{ model: GradeLevel, attributes: ['name'] }]
            },
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

const exportSnapshot = async (req, res) => {
  try {
    const academicYears = await AcademicYear.findAll();
    const gradeLevels = await GradeLevel.findAll();
    const classes = await Class.findAll();
    const lessons = await Lesson.findAll();
    const timeSlots = await TimeSlot.findAll();
    const curriculums = await Curriculum.findAll();
    const schedules = await Schedule.findAll();
    const users = await User.findAll();
    const activities = await Activity.findAll();
    const approvalRequests = await ApprovalRequest.findAll();

    const snapshot = {
      exportedAt: new Date(),
      academicYears,
      gradeLevels,
      classes,
      lessons,
      timeSlots,
      curriculums,
      schedules,
      users,
      activities,
      approvalRequests
    };

    res.json(snapshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengekspor snapshot database' });
  }
};

const importSnapshot = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      academicYears,
      gradeLevels,
      classes,
      lessons,
      timeSlots,
      curriculums,
      schedules,
      users,
      activities,
      approvalRequests
    } = req.body;

    // Disable foreign keys temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

    // Truncate tables in transaction
    await ApprovalRequest.destroy({ where: {}, transaction });
    await Activity.destroy({ where: {}, transaction });
    await Schedule.destroy({ where: {}, transaction });
    await Curriculum.destroy({ where: {}, transaction });
    await TimeSlot.destroy({ where: {}, transaction });
    await Class.destroy({ where: {}, transaction });
    await GradeLevel.destroy({ where: {}, transaction });
    await Lesson.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });
    await AcademicYear.destroy({ where: {}, transaction });

    // Re-populate tables
    if (academicYears && academicYears.length > 0) await AcademicYear.bulkCreate(academicYears, { transaction });
    if (users && users.length > 0) await User.bulkCreate(users, { transaction });
    if (gradeLevels && gradeLevels.length > 0) await GradeLevel.bulkCreate(gradeLevels, { transaction });
    if (lessons && lessons.length > 0) await Lesson.bulkCreate(lessons, { transaction });
    if (classes && classes.length > 0) await Class.bulkCreate(classes, { transaction });
    if (timeSlots && timeSlots.length > 0) await TimeSlot.bulkCreate(timeSlots, { transaction });
    if (curriculums && curriculums.length > 0) await Curriculum.bulkCreate(curriculums, { transaction });
    if (schedules && schedules.length > 0) await Schedule.bulkCreate(schedules, { transaction });
    if (activities && activities.length > 0) await Activity.bulkCreate(activities, { transaction });
    if (approvalRequests && approvalRequests.length > 0) await ApprovalRequest.bulkCreate(approvalRequests, { transaction });

    // Enable foreign keys back
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
    await transaction.commit();

    res.json({ message: 'Snapshot database berhasil di-import!' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Gagal mengimpor snapshot database: ' + error.message });
  }
};

const getDailyAttendanceReport = async (req, res) => {
  try {
    const { date, startDate, endDate, teacherId, classId, lessonId, status: filterStatus, search, page = 1, limit = 10 } = req.query;

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) {
      return res.json({ summary: { totalScheduled: 0, totalHadir: 0, totalTelat: 0, totalAlpa: 0, totalIzin: 0, totalBelumMulai: 0, totalBelumAbsen: 0 }, details: [], meta: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 10 } });
    }

    const sysSetting = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const attendanceFlow = sysSetting ? sysSetting.value : 'disabled';

    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
    const getJakartaDateStr = (d) => {
      const p = formatter.formatToParts(d);
      return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}-${p.find(x=>x.type==='day').value}`;
    };

    let startStr = startDate || date || getJakartaDateStr(new Date());
    let endStr = endDate || date || getJakartaDateStr(new Date());

    const rangeStart = new Date(`${startStr}T00:00:00+07:00`);
    const rangeEnd = new Date(`${endStr}T23:59:59+07:00`);

    const allSchedules = await Schedule.findAll({
      where: { academicYearId: activeYear.id },
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Lesson, attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'username'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] }
      ]
    });

    const activities = await Activity.findAll({
      where: { timestamp: { [Op.gte]: rangeStart, [Op.lte]: rangeEnd } }
    });

    const dates = [];
    let curr = new Date(rangeStart);
    while (curr <= rangeEnd) {
      const yr = curr.getFullYear();
      const mo = String(curr.getMonth() + 1).padStart(2, '0');
      const da = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yr}-${mo}-${da}`);
      curr.setDate(curr.getDate() + 1);
    }

    const dayMap = { sunday: 'minggu', monday: 'senin', tuesday: 'selasa', wednesday: 'rabu', thursday: 'kamis', friday: 'jumat', saturday: 'sabtu' };
    const now = new Date();
    let allDetails = [];

    for (const dateStr of dates) {
      const dateObj = new Date(`${dateStr}T12:00:00+07:00`);
      const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'long' }).format(dateObj).toLowerCase();
      const indonesianDayName = dayMap[weekdayName] || 'senin';

      const daySchedules = allSchedules.filter(s => s.day.toLowerCase() === indonesianDayName);
      const dayActStart = new Date(`${dateStr}T00:00:00+07:00`);
      const dayActEnd = new Date(`${dateStr}T23:59:59+07:00`);

      for (const s of daySchedules) {
        const scheduleStartTime = s.TimeSlot?.startTime || s.startTime;
        const scheduleEndTime = s.TimeSlot?.endTime || s.endTime;
        const startTimeDate = new Date(`${dateStr}T${scheduleStartTime}+07:00`);
        const endTimeDate = new Date(`${dateStr}T${scheduleEndTime}+07:00`);

        const activity = activities.find(a => 
          a.scheduleId === s.id && 
          new Date(a.timestamp) >= dayActStart && 
          new Date(a.timestamp) <= dayActEnd
        );

        const hasGeneralLeave = activities.some(a => 
          a.userId === s.teacherId && 
          a.status === 'tidak_hadir' &&
          !a.scheduleId &&
          new Date(a.timestamp) >= dayActStart && 
          new Date(a.timestamp) <= dayActEnd
        );

        let status = 'belum_mulai';
        if (activity) {
          if (attendanceFlow === 'full_day' && activity.isApproveCheckOut === false && now > endTimeDate) status = 'alpa';
          else if (activity.status === 'masuk') status = 'hadir';
          else if (activity.status === 'telat') status = 'telat';
          else if (activity.status === 'tidak_hadir') status = 'izin';
        } else if (hasGeneralLeave) {
          status = 'izin';
        } else {
          if (now > endTimeDate) status = 'alpa';
          else if (now >= startTimeDate && now <= endTimeDate) status = 'belum_absen';
          else status = 'belum_mulai';
        }

        allDetails.push({
          id: s.id + '-' + dateStr,
          date: dateStr,
          scheduleId: s.id,
          teacherId: s.teacher?.id,
          teacherName: s.teacher?.name || 'Unknown Teacher',
          classId: s.Class?.id,
          className: s.Class?.name || 'Unknown Class',
          lessonId: s.Lesson?.id,
          lessonName: s.Lesson?.name || 'Unknown Lesson',
          timeSlotLabel: s.TimeSlot?.label || 'Jam Pelajaran',
          timeRange: `${scheduleStartTime.substring(0, 5)} - ${scheduleEndTime.substring(0, 5)}`,
          status,
          checkInTime: activity?.timestamp || null,
          photoSelfie: activity?.photoSelfie || null,
          photoClass: activity?.photoClass || null
        });
      }
    }

    allDetails.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.timeRange !== b.timeRange) return a.timeRange.localeCompare(b.timeRange);
      if (a.className !== b.className) return b.className.localeCompare(a.className);
      if (a.teacherName !== b.teacherName) return a.teacherName.localeCompare(b.teacherName);
      return a.lessonName.localeCompare(b.lessonName);
    });

    let filteredDetails = allDetails;
    if (teacherId) filteredDetails = filteredDetails.filter(d => d.teacherId === teacherId);
    if (classId) filteredDetails = filteredDetails.filter(d => d.classId === classId);
    if (lessonId) filteredDetails = filteredDetails.filter(d => d.lessonId === lessonId);
    if (filterStatus) filteredDetails = filteredDetails.filter(d => d.status === filterStatus);
    
    if (search) {
      const q = search.toLowerCase();
      filteredDetails = filteredDetails.filter(d => 
        d.teacherName.toLowerCase().includes(q) ||
        d.className.toLowerCase().includes(q) ||
        d.lessonName.toLowerCase().includes(q)
      );
    }

    let totalHadir = 0, totalTelat = 0, totalAlpa = 0, totalIzin = 0, totalBelumMulai = 0, totalBelumAbsen = 0;
    filteredDetails.forEach(d => {
      if (d.status === 'hadir') totalHadir++;
      else if (d.status === 'telat') totalTelat++;
      else if (d.status === 'alpa') totalAlpa++;
      else if (d.status === 'izin') totalIzin++;
      else if (d.status === 'belum_mulai') totalBelumMulai++;
      else if (d.status === 'belum_absen') totalBelumAbsen++;
    });

    const summary = { totalScheduled: filteredDetails.length, totalHadir, totalTelat, totalAlpa, totalIzin, totalBelumMulai, totalBelumAbsen };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedData = filteredDetails.slice(startIndex, startIndex + limitNum);

    res.json({
      summary,
      details: paginatedData,
      meta: {
        totalItems: filteredDetails.length,
        totalPages: Math.ceil(filteredDetails.length / limitNum) || 1,
        currentPage: pageNum,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat laporan kehadiran harian' });
  }
};

const getTeacherScheduleReport = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.json([]);

    const schedules = await Schedule.findAll({
      where: {
        teacherId,
        academicYearId: activeYear.id
      },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] }
      ]
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil laporan jadwal guru' });
  }
};

const exportDailyAttendanceExcel = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    
    // 1. Resolve date & indonesian weekday
    let targetDateStr = date;
    if (!targetDateStr) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const parts = formatter.formatToParts(new Date());
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      targetDateStr = `${year}-${month}-${day}`;
    }

    const parts = targetDateStr.split('-');
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];

    const start = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00+07:00`);
    const end = new Date(`${yearStr}-${monthStr}-${dayStr}T23:59:59+07:00`);

    const dateObj = new Date(`${yearStr}-${monthStr}-${dayStr}T12:00:00+07:00`);
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long'
    });
    const weekdayName = dayFormatter.formatToParts(dateObj).find(p => p.type === 'weekday').value.toLowerCase();
    
    const dayMap = {
      sunday: 'minggu',
      monday: 'senin',
      tuesday: 'selasa',
      wednesday: 'rabu',
      thursday: 'kamis',
      friday: 'jumat',
      saturday: 'sabtu'
    };
    const indonesianDayName = dayMap[weekdayName] || 'senin';

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.status(404).json({ message: 'Tahun ajaran aktif tidak ditemukan' });

    const sysSetting = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const attendanceFlow = sysSetting ? sysSetting.value : 'disabled';

    // 2. Fetch TimeSlots (X Axis columns) untuk hari ini saja
    const timeSlots = await TimeSlot.findAll({
      where: {
        academicYearId: activeYear.id,
        day: indonesianDayName
      },
      order: [['startTime', 'ASC']]
    });

    // 3. Fetch Schedules for today
    const schedules = await Schedule.findAll({
      where: {
        day: indonesianDayName,
        academicYearId: activeYear.id
      },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] },
        { model: User, as: 'teacher', attributes: ['id', 'name'] },
        { model: TimeSlot, attributes: ['id', 'label', 'startTime', 'endTime'] }
      ]
    });

    // 4. Fetch Activities for today
    const activities = await Activity.findAll({
      where: {
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    // Get unique teachers scheduled today
    const teacherMap = new Map();
    schedules.forEach(s => {
      if (s.teacher && !teacherMap.has(s.teacher.id)) {
        teacherMap.set(s.teacher.id, s.teacher.name);
      }
    });
    const scheduledTeachers = Array.from(teacherMap.entries()).map(([id, name]) => ({ id, name }));
    // Sort teachers alphabetically
    scheduledTeachers.sort((a, b) => a.name.localeCompare(b.name));

    // 5. Build Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Harian');

    const baseCols = 1 + timeSlots.length + (attendanceFlow === 'full_day' ? 2 : 0);
    const totalCols = Math.max(7, baseCols);

    // Title banner
    sheet.mergeCells(1, 1, 1, totalCols);
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value = 'LAPORAN REKAP KEHADIRAN HARIAN GURU';
    titleRow.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 40;

    sheet.mergeCells(2, 1, 2, totalCols);
    const subRow = sheet.getRow(2);
    subRow.getCell(1).value = `Hari: ${indonesianDayName.toUpperCase()} | Tanggal: ${dayStr}-${monthStr}-${yearStr} | Tahun Ajaran: ${activeYear.name}`;
    subRow.getCell(1).font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    subRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    subRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    subRow.height = 25;

    // Legend Row at Row 4
    sheet.getRow(4).getCell(1).value = 'Ket. Status:';
    sheet.getRow(4).getCell(1).font = { bold: true, size: 9 };
    
    const legendItems = [
      { text: 'H = Hadir (Tepat Waktu)', fg: '065F46', bg: 'A7F3D0' },
      { text: 'T = Terlambat', fg: '92400E', bg: 'FDE68A' },
      { text: 'I/S = Izin / Sakit', fg: '1E40AF', bg: 'BFDBFE' },
      { text: 'A = Alpa (Bolos)', fg: '991B1B', bg: 'FCA5A5' },
      { text: 'B = Belum Mulai', fg: '475569', bg: 'E2E8F0' },
      { text: '- = Tidak Ada KBM', fg: '94A3B8', bg: 'F1F5F9' }
    ];

    legendItems.forEach((item, idx) => {
      const colIdx = idx + 2;
      const cell = sheet.getRow(4).getCell(colIdx);
      cell.value = item.text;
      cell.font = { bold: true, size: 9, color: { argb: 'FF' + item.fg } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + item.bg } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    sheet.getRow(4).height = 22;

    // Header Row at Row 6
    const headerRowIdx = 6;
    const headerRow = sheet.getRow(headerRowIdx);
    headerRow.getCell(1).value = 'NAMA GURU';
    headerRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    headerRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

    timeSlots.forEach((slot, idx) => {
      const colIdx = idx + 2;
      const cell = headerRow.getCell(colIdx);
      cell.value = `${slot.label}\n(${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)})`;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    if (attendanceFlow === 'full_day') {
      const checkInColIdx = 2 + timeSlots.length;
      const checkOutColIdx = 3 + timeSlots.length;

      const checkInCell = headerRow.getCell(checkInColIdx);
      checkInCell.value = 'Jam Datang';
      checkInCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
      checkInCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      checkInCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const checkOutCell = headerRow.getCell(checkOutColIdx);
      checkOutCell.value = 'Jam Pulang';
      checkOutCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
      checkOutCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      checkOutCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }

    headerRow.height = 35;

    const now = new Date();

    // Populate data rows starting at Row 7
    let currentRowIdx = 7;
    scheduledTeachers.forEach(teacher => {
      const row = sheet.getRow(currentRowIdx);
      row.getCell(1).value = teacher.name;
      row.getCell(1).font = { bold: true, size: 10 };
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(1).border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };

      let firstCheckIn = null;
      let clockOutTime = null;

      timeSlots.forEach((slot, slotIdx) => {
        const colIdx = slotIdx + 2;
        const cell = row.getCell(colIdx);
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // Find if teacher has schedule for this slot
        const schedule = schedules.find(s => s.teacherId === teacher.id && (s.timeSlotId === slot.id || s.TimeSlot?.id === slot.id));
        if (!schedule) {
          cell.value = '-';
          cell.font = { color: { argb: 'FFCBD5E1' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          return;
        }

        // Correlate status
        const activity = activities.find(a => a.scheduleId === schedule.id);
        const hasGeneralLeave = activities.some(a => a.userId === teacher.id && a.status === 'tidak_hadir' && !a.scheduleId);

        const scheduleStartTime = slot.startTime;
        const scheduleEndTime = slot.endTime;
        const startTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${scheduleStartTime}+07:00`);
        const endTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${scheduleEndTime}+07:00`);

        let symbol = '-';
        let fgColor = '475569';
        let bgColor = 'F1F5F9';

        if (activity) {
          if (attendanceFlow === 'full_day' && activity.isApproveCheckOut === false && now > endTimeDate) {
            symbol = 'A';
            fgColor = '991B1B';
            bgColor = 'FCA5A5';
          } else if (activity.status === 'masuk') {
            symbol = 'H';
            fgColor = '065F46';
            bgColor = 'A7F3D0';
          } else if (activity.status === 'telat') {
            symbol = 'T';
            fgColor = '92400E';
            bgColor = 'FDE68A';
          } else if (activity.status === 'tidak_hadir') {
            if (activity.type === 'corporate_alpa') {
              symbol = 'A';
              fgColor = '991B1B';
              bgColor = 'FCA5A5';
            } else {
              symbol = 'I/S';
              fgColor = '1E40AF';
              bgColor = 'BFDBFE';
            }
          }
          
          if (!firstCheckIn || new Date(activity.timestamp) < new Date(firstCheckIn)) {
            firstCheckIn = activity.timestamp;
          }
          if (activity.clockOutTime && (!clockOutTime || new Date(activity.clockOutTime) > new Date(clockOutTime))) {
            clockOutTime = activity.clockOutTime;
          }
        } else if (hasGeneralLeave) {
          symbol = 'I/S';
          fgColor = '1E40AF';
          bgColor = 'BFDBFE';
        } else {
          if (now > endTimeDate) {
            symbol = 'A';
            fgColor = '991B1B';
            bgColor = 'FCA5A5';
          } else {
            symbol = 'B';
            fgColor = '475569';
            bgColor = 'E2E8F0';
          }
        }

        cell.value = symbol;
        cell.font = { bold: true, size: 11, color: { argb: 'FF' + fgColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgColor } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      if (attendanceFlow === 'full_day') {
        const checkInColIdx = 2 + timeSlots.length;
        const checkOutColIdx = 3 + timeSlots.length;

        const checkInCell = row.getCell(checkInColIdx);
        checkInCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        checkInCell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (firstCheckIn) {
            checkInCell.value = new Date(firstCheckIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            checkInCell.font = { size: 10, bold: true };
        } else {
            checkInCell.value = '-';
            checkInCell.font = { color: { argb: 'FFCBD5E1' } };
        }

        const checkOutCell = row.getCell(checkOutColIdx);
        checkOutCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        checkOutCell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (clockOutTime) {
            checkOutCell.value = new Date(clockOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            checkOutCell.font = { size: 10, bold: true };
        } else {
            // Default checkout to last schedule's endTime if past and they checked in
            let defaultClockOut = null;
            if (firstCheckIn) {
              const teacherSchedules = schedules.filter(s => s.teacherId === teacher.id);
              if (teacherSchedules.length > 0) {
                teacherSchedules.sort((a, b) => {
                  const aTime = a.TimeSlot?.endTime || a.endTime || '00:00:00';
                  const bTime = b.TimeSlot?.endTime || b.endTime || '00:00:00';
                  return aTime.localeCompare(bTime);
                });
                const lastSched = teacherSchedules[teacherSchedules.length - 1];
                const lastEndTime = lastSched.TimeSlot?.endTime || lastSched.endTime;
                if (lastEndTime) {
                  const lastEndTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${lastEndTime}+07:00`);
                  if (now >= lastEndTimeDate) {
                    defaultClockOut = lastEndTimeDate;
                  }
                }
              }
            }

            if (defaultClockOut) {
              const timeStr = defaultClockOut.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              checkOutCell.value = `${timeStr} (Auto)`;
              checkOutCell.font = { size: 10, bold: true, color: { argb: 'FF92400E' } };
            } else {
              checkOutCell.value = '-';
              checkOutCell.font = { color: { argb: 'FFCBD5E1' } };
            }
        }
      }

      row.height = 25;
      currentRowIdx++;
    });

    // Auto fit column A
    sheet.getColumn(1).width = 30;
    timeSlots.forEach((_, idx) => {
      sheet.getColumn(idx + 2).width = 18;
    });
    if (attendanceFlow === 'full_day') {
      sheet.getColumn(2 + timeSlots.length).width = 15;
      sheet.getColumn(3 + timeSlots.length).width = 15;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rekap_absensi_${targetDateStr}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengekspor rekap absensi harian excel' });
  }
};

const exportTeacherScheduleExcel = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findByPk(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Guru tidak ditemukan' });

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.status(404).json({ message: 'Tahun ajaran aktif tidak ditemukan' });

    // Fetch weekly schedules
    const schedules = await Schedule.findAll({
      where: {
        teacherId,
        academicYearId: activeYear.id
      },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Lesson, attributes: ['name'] },
        { model: TimeSlot, attributes: ['id', 'label', 'startTime', 'endTime'] }
      ]
    });

    // Fetch TimeSlots
    const timeSlots = await TimeSlot.findAll({
      where: { academicYearId: activeYear.id },
      order: [['startTime', 'ASC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Jadwal Guru');

    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

    // 1. Group time slots by day and sort them chronologically
    const slotsPerDay = {};
    days.forEach(day => {
      slotsPerDay[day] = timeSlots
        .filter(ts => ts.day.toLowerCase() === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // 2. Generate a pattern fingerprint for each day based on start-end times
    const dayFingerprints = {};
    days.forEach(day => {
      const daySlots = slotsPerDay[day];
      dayFingerprints[day] = daySlots
        .map(ts => `${ts.startTime.substring(0, 5)}-${ts.endTime.substring(0, 5)}`)
        .join('|');
    });

    // 3. Group active days by matching fingerprints
    const activeDays = days.filter(day => slotsPerDay[day].length > 0);
    const groups = [];
    activeDays.forEach(day => {
      const fp = dayFingerprints[day];
      const existing = groups.find(g => g.fingerprint === fp);
      if (existing) {
        existing.days.push(day);
      } else {
        groups.push({
          fingerprint: fp,
          days: [day],
          slots: slotsPerDay[day]
        });
      }
    });

    if (groups.length === 0) {
      sheet.mergeCells('A1:C1');
      const emptyCell = sheet.getCell('A1');
      emptyCell.value = `BELUM ADA PLOTTING JADWAL MENGAJAR GURU - ${teacher.name}`;
      emptyCell.font = { bold: true, size: 12 };
      emptyCell.alignment = { horizontal: 'center' };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=jadwal_${teacher.username}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    // 4. Calculate total columns spanning for titles
    let totalColumns = 0;
    groups.forEach((group, idx) => {
      totalColumns += 1 + group.days.length; // 1 (Waktu) + days
      if (idx < groups.length - 1) {
        totalColumns += 1; // Spacer column
      }
    });

    // Title banner
    sheet.mergeCells(1, 1, 1, totalColumns);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `JADWAL MENGAJAR MINGGUAN GURU`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 40;

    sheet.mergeCells(2, 1, 2, totalColumns);
    const subCell = sheet.getCell(2, 1);
    subCell.value = `Guru Pengajar: ${teacher.name.toUpperCase()} | Tahun Ajaran: ${activeYear.name}`;
    subCell.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 25;

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // 5. Render groups horizontally
    let currentCol = 1;
    groups.forEach((group, gIdx) => {
      const startCol = currentCol;
      const headerRowIdx = 4;
      const headerRow = sheet.getRow(headerRowIdx);

      // Render Time Header
      const timeHeaderCell = headerRow.getCell(startCol);
      timeHeaderCell.value = 'WAKTU / JAM';
      sheet.getColumn(startCol).width = 18;

      // Render Days Headers
      group.days.forEach((day, dIdx) => {
        const dayCol = startCol + 1 + dIdx;
        const dayHeaderCell = headerRow.getCell(dayCol);
        dayHeaderCell.value = capitalize(day);
        sheet.getColumn(dayCol).width = 24;
      });

      // Style Headers
      for (let c = startCol; c < startCol + 1 + group.days.length; c++) {
        const cell = headerRow.getCell(c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      }
      headerRow.height = 30;

      // Render Data Rows for this group
      group.slots.forEach((slot, sIdx) => {
        const rowIdx = 5 + sIdx;
        const row = sheet.getRow(rowIdx);
        row.height = 45; // Row height for multi-line

        // Waktu Cell
        const timeCell = row.getCell(startCol);
        timeCell.value = `${slot.label}\n(${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)})`;
        timeCell.font = { bold: true, size: 9, color: { argb: 'FF475569' } };
        timeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        timeCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        timeCell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // Days columns
        group.days.forEach((day, dIdx) => {
          const dayCol = startCol + 1 + dIdx;
          const cell = row.getCell(dayCol);
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };

          // Find schedule matching day and time interval
          const daySlots = slotsPerDay[day];
          const actualSlot = daySlots.find(ts => 
            ts.startTime.substring(0, 5) === slot.startTime.substring(0, 5) && 
            ts.endTime.substring(0, 5) === slot.endTime.substring(0, 5)
          );

          if (actualSlot) {
            const schedule = schedules.find(s => s.day.toLowerCase() === day && (s.timeSlotId === actualSlot.id || s.TimeSlot?.id === actualSlot.id));
            if (schedule) {
              cell.value = `${schedule.Lesson?.name || 'Mata Pelajaran'}\n${schedule.Class?.name || ''}`;
              cell.font = { bold: true, size: 9, color: { argb: 'FF0F172A' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } }; // Light mint
            } else {
              cell.value = '-';
              cell.font = { color: { argb: 'FFCBD5E1' } };
            }
          } else {
            cell.value = '-';
            cell.font = { color: { argb: 'FFCBD5E1' } };
          }
        });
      });

      // Move cursor past time column + days columns
      currentCol += 1 + group.days.length;

      // Add spacer column if it's not the last group
      if (gIdx < groups.length - 1) {
        sheet.getColumn(currentCol).width = 4; // Thin spacer column
        currentCol += 1;
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=jadwal_${teacher.username}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengekspor jadwal guru ke excel' });
  }
};

const exportDailyAttendanceListExcel = async (req, res) => {
  try {
    const { date, startDate, endDate, teacherId, classId, lessonId, status: filterStatus, search } = req.query;

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.status(404).json({ message: 'Tidak ada tahun ajaran aktif.' });

    const sysSetting = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const attendanceFlow = sysSetting ? sysSetting.value : 'disabled';

    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
    const getJakartaDateStr = (d) => {
      const p = formatter.formatToParts(d);
      return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}-${p.find(x=>x.type==='day').value}`;
    };

    let startStr = startDate || date || getJakartaDateStr(new Date());
    let endStr = endDate || date || getJakartaDateStr(new Date());

    const rangeStart = new Date(`${startStr}T00:00:00+07:00`);
    const rangeEnd = new Date(`${endStr}T23:59:59+07:00`);

    const allSchedules = await Schedule.findAll({
      where: { academicYearId: activeYear.id },
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Lesson, attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'username'] },
        { model: TimeSlot, attributes: ['label', 'startTime', 'endTime'] }
      ]
    });

    const activities = await Activity.findAll({
      where: { timestamp: { [Op.gte]: rangeStart, [Op.lte]: rangeEnd } }
    });

    const dates = [];
    let curr = new Date(rangeStart);
    while (curr <= rangeEnd) {
      const yr = curr.getFullYear();
      const mo = String(curr.getMonth() + 1).padStart(2, '0');
      const da = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yr}-${mo}-${da}`);
      curr.setDate(curr.getDate() + 1);
    }

    const dayMap = { sunday: 'minggu', monday: 'senin', tuesday: 'selasa', wednesday: 'rabu', thursday: 'kamis', friday: 'jumat', saturday: 'sabtu' };
    const now = new Date();
    let allDetails = [];

    for (const dateStr of dates) {
      const dateObj = new Date(`${dateStr}T12:00:00+07:00`);
      const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', weekday: 'long' }).format(dateObj).toLowerCase();
      const indonesianDayName = dayMap[weekdayName] || 'senin';

      const daySchedules = allSchedules.filter(s => s.day.toLowerCase() === indonesianDayName);
      const dayActStart = new Date(`${dateStr}T00:00:00+07:00`);
      const dayActEnd = new Date(`${dateStr}T23:59:59+07:00`);

      for (const s of daySchedules) {
        const scheduleStartTime = s.TimeSlot?.startTime || s.startTime;
        const scheduleEndTime = s.TimeSlot?.endTime || s.endTime;
        const startTimeDate = new Date(`${dateStr}T${scheduleStartTime}+07:00`);
        const endTimeDate = new Date(`${dateStr}T${scheduleEndTime}+07:00`);

        const activity = activities.find(a => 
          a.scheduleId === s.id && 
          new Date(a.timestamp) >= dayActStart && 
          new Date(a.timestamp) <= dayActEnd
        );

        const hasGeneralLeave = activities.some(a => 
          a.userId === s.teacherId && 
          a.status === 'tidak_hadir' &&
          !a.scheduleId &&
          new Date(a.timestamp) >= dayActStart && 
          new Date(a.timestamp) <= dayActEnd
        );

        let status = 'belum_mulai';
        if (activity) {
          if (attendanceFlow === 'full_day' && activity.isApproveCheckOut === false && now > endTimeDate) status = 'alpa';
          else if (activity.status === 'masuk') status = 'hadir';
          else if (activity.status === 'telat') status = 'telat';
          else if (activity.status === 'tidak_hadir') {
            status = activity.type === 'corporate_alpa' ? 'alpa' : 'izin';
          }
        } else if (hasGeneralLeave) {
          status = 'izin';
        } else {
          if (now > endTimeDate) status = 'alpa';
          else if (now >= startTimeDate && now <= endTimeDate) status = 'belum_absen';
        }

        allDetails.push({
          id: s.id + '_' + dateStr,
          date: dateStr,
          scheduleId: s.id,
          teacherId: s.teacherId,
          teacherName: s.teacher?.name || 'Unknown',
          className: s.Class?.name || 'Unknown',
          lessonId: s.lessonId,
          classId: s.classId,
          lessonName: s.Lesson?.name || 'Unknown',
          timeSlotLabel: s.TimeSlot?.label || '-',
          timeRange: `${scheduleStartTime.slice(0,5)} - ${scheduleEndTime.slice(0,5)}`,
          status,
          checkInTime: activity?.timestamp || null,
        });
      }
    }

    allDetails.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.timeRange !== b.timeRange) return a.timeRange.localeCompare(b.timeRange);
      if (a.className !== b.className) return b.className.localeCompare(a.className);
      if (a.teacherName !== b.teacherName) return a.teacherName.localeCompare(b.teacherName);
      return a.lessonName.localeCompare(b.lessonName);
    });

    let filteredDetails = allDetails;
    if (teacherId) filteredDetails = filteredDetails.filter(d => d.teacherId === teacherId);
    if (classId) filteredDetails = filteredDetails.filter(d => d.classId === classId);
    if (lessonId) filteredDetails = filteredDetails.filter(d => d.lessonId === lessonId);
    if (filterStatus) filteredDetails = filteredDetails.filter(d => d.status === filterStatus);
    
    if (search) {
      const q = search.toLowerCase();
      filteredDetails = filteredDetails.filter(d => 
        d.teacherName.toLowerCase().includes(q) ||
        d.className.toLowerCase().includes(q) ||
        d.lessonName.toLowerCase().includes(q)
      );
    }

    // Build Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Export Data List');

    // Title Row
    sheet.mergeCells(1, 1, 1, 8);
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value = `EXPORT DATA KEHADIRAN HARIAN (${startStr === endStr ? startStr : `${startStr} s/d ${endStr}`})`;
    titleRow.getCell(1).font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;

    // Headers
    const headerRow = sheet.getRow(3);
    const columns = ['No', 'Tanggal', 'Jam KBM', 'Mata Pelajaran', 'Kelas', 'Guru Pengajar', 'Waktu Absen', 'Status'];
    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = col;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data Rows
    filteredDetails.forEach((row, idx) => {
      const dataRow = sheet.getRow(idx + 4);
      dataRow.getCell(1).value = idx + 1;
      dataRow.getCell(2).value = row.date;
      dataRow.getCell(3).value = `${row.timeSlotLabel} (${row.timeRange})`;
      dataRow.getCell(4).value = row.lessonName;
      dataRow.getCell(5).value = row.className;
      dataRow.getCell(6).value = row.teacherName;
      
      let waktuAbsen = '-';
      if (row.checkInTime) {
         const dateObj = new Date(row.checkInTime);
         const hrs = String(dateObj.getHours()).padStart(2, '0');
         const mins = String(dateObj.getMinutes()).padStart(2, '0');
         waktuAbsen = `${hrs}:${mins} WIB`;
      }
      dataRow.getCell(7).value = waktuAbsen;
      
      let statusStr = row.status;
      if (statusStr === 'hadir') statusStr = 'Hadir (Tepat)';
      if (statusStr === 'telat') statusStr = 'Terlambat';
      if (statusStr === 'izin') statusStr = 'Izin / Sakit';
      if (statusStr === 'alpa') statusStr = 'Alpa (Kosong)';
      if (statusStr === 'belum_absen') statusStr = 'Berlangsung';
      if (statusStr === 'belum_mulai') statusStr = 'Belum Mulai';
      dataRow.getCell(8).value = statusStr;

      // Alignments
      dataRow.getCell(1).alignment = { horizontal: 'center' };
      dataRow.getCell(2).alignment = { horizontal: 'center' };
      dataRow.getCell(3).alignment = { horizontal: 'center' };
      dataRow.getCell(7).alignment = { horizontal: 'center' };
      dataRow.getCell(8).alignment = { horizontal: 'center' };
    });

    // Column widths
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 12;
    sheet.getColumn(3).width = 25;
    sheet.getColumn(4).width = 25;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 30;
    sheet.getColumn(7).width = 15;
    sheet.getColumn(8).width = 15;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=export_data_list_${startStr}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengekspor data laporan kehadiran harian' });
  }
};

const getDailyAttendanceMatrixData = async (req, res) => {
  try {
    const { date } = req.query; // optional date, default to today

    let targetDateStr = date;
    if (!targetDateStr) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const parts = formatter.formatToParts(new Date());
      const year = parts.find(p => p.type === 'year').value;
      const month = parts.find(p => p.type === 'month').value;
      const day = parts.find(p => p.type === 'day').value;
      targetDateStr = `${year}-${month}-${day}`;
    }

    const parts = targetDateStr.split('-');
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];

    const start = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00+07:00`);
    const end = new Date(`${yearStr}-${monthStr}-${dayStr}T23:59:59+07:00`);

    const dateObj = new Date(`${yearStr}-${monthStr}-${dayStr}T12:00:00+07:00`);
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long'
    });
    const weekdayName = dayFormatter.formatToParts(dateObj).find(p => p.type === 'weekday').value.toLowerCase();
    
    const dayMap = {
      sunday: 'minggu',
      monday: 'senin',
      tuesday: 'selasa',
      wednesday: 'rabu',
      thursday: 'kamis',
      friday: 'jumat',
      saturday: 'sabtu'
    };
    const indonesianDayName = dayMap[weekdayName] || 'senin';

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    if (!activeYear) return res.status(404).json({ message: 'Tahun ajaran aktif tidak ditemukan' });

    const sysSetting = await SystemSetting.findOne({ where: { key: 'attendance_flow' } });
    const attendanceFlow = sysSetting ? sysSetting.value : 'disabled';

    // Fetch TimeSlots for today
    const timeSlots = await TimeSlot.findAll({
      where: {
        academicYearId: activeYear.id,
        day: indonesianDayName
      },
      order: [['startTime', 'ASC']]
    });

    // Fetch Schedules for today
    const schedules = await Schedule.findAll({
      where: {
        day: indonesianDayName,
        academicYearId: activeYear.id
      },
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Lesson, attributes: ['id', 'name'] },
        { model: User, as: 'teacher', attributes: ['id', 'name'] },
        { model: TimeSlot, attributes: ['id', 'label', 'startTime', 'endTime'] }
      ]
    });

    // Fetch Activities for today
    const activities = await Activity.findAll({
      where: {
        timestamp: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    // Get unique teachers scheduled today
    const teacherMap = new Map();
    schedules.forEach(s => {
      if (s.teacher && !teacherMap.has(s.teacher.id)) {
        teacherMap.set(s.teacher.id, s.teacher.name);
      }
    });
    const scheduledTeachers = Array.from(teacherMap.entries()).map(([id, name]) => ({ id, name }));
    scheduledTeachers.sort((a, b) => a.name.localeCompare(b.name));

    const now = new Date();

    // Map the matrix row by row
    const matrix = scheduledTeachers.map(teacher => {
      const teacherSlots = {};
      
      timeSlots.forEach(slot => {
        const schedule = schedules.find(s => s.teacherId === teacher.id && (s.timeSlotId === slot.id || s.TimeSlot?.id === slot.id));
        if (!schedule) {
          teacherSlots[slot.id] = null; // No schedule
          return;
        }

        const activity = activities.find(a => a.scheduleId === schedule.id);
        const hasGeneralLeave = activities.some(a => a.userId === teacher.id && a.status === 'tidak_hadir' && !a.scheduleId);

        const scheduleStartTime = slot.startTime;
        const scheduleEndTime = slot.endTime;
        const startTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${scheduleStartTime}+07:00`);
        const endTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${scheduleEndTime}+07:00`);

        let status = 'belum_mulai';
        if (activity) {
          if (activity.status === 'masuk') status = 'hadir';
          else if (activity.status === 'telat') status = 'telat';
          else if (activity.status === 'tidak_hadir') {
            status = activity.type === 'corporate_alpa' ? 'alpa' : 'izin';
          }
          else status = activity.status;
        } else if (hasGeneralLeave) {
          status = 'izin';
        } else {
          if (now > endTimeDate) status = 'alpa';
          else if (now >= startTimeDate && now <= endTimeDate) status = 'belum_absen';
          else status = 'belum_mulai';
        }

        teacherSlots[slot.id] = {
          scheduleId: schedule.id,
          classId: schedule.Class?.id,
          className: schedule.Class?.name,
          lessonId: schedule.Lesson?.id,
          lessonName: schedule.Lesson?.name,
          status,
          checkInTime: activity?.timestamp || null,
          photoSelfie: activity?.photoSelfie || null,
          photoClass: activity?.photoClass || null,
          description: activity?.description || null
        };
      });

      let firstCheckIn = null;
      let lastCheckOut = null;
      
      const teacherActivities = activities.filter(a => a.userId === teacher.id);
      teacherActivities.forEach(a => {
        if (!firstCheckIn || new Date(a.timestamp) < new Date(firstCheckIn)) firstCheckIn = a.timestamp;
        if (a.clockOutTime && (!lastCheckOut || new Date(a.clockOutTime) > new Date(lastCheckOut))) {
          lastCheckOut = a.clockOutTime;
        }
      });

      if (!lastCheckOut && firstCheckIn && attendanceFlow === 'full_day') {
        const teacherSchedules = schedules.filter(s => s.teacherId === teacher.id);
        if (teacherSchedules.length > 0) {
          teacherSchedules.sort((a, b) => {
            const aTime = a.TimeSlot?.endTime || a.endTime || '00:00:00';
            const bTime = b.TimeSlot?.endTime || b.endTime || '00:00:00';
            return aTime.localeCompare(bTime);
          });
          const lastSched = teacherSchedules[teacherSchedules.length - 1];
          const lastEndTime = lastSched.TimeSlot?.endTime || lastSched.endTime;
          if (lastEndTime) {
            const lastEndTimeDate = new Date(`${yearStr}-${monthStr}-${dayStr}T${lastEndTime}+07:00`);
            if (now >= lastEndTimeDate) {
              lastCheckOut = lastEndTimeDate;
            }
          }
        }
      }

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        firstCheckIn,
        lastCheckOut,
        slots: teacherSlots
      };
    });

    res.json({
      date: targetDateStr,
      dayName: indonesianDayName,
      academicYearName: activeYear.name,
      timeSlots,
      matrix
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data matriks kehadiran harian' });
  }
};

module.exports = {
  getAllActivities,
  exportReport,
  exportSnapshot,
  importSnapshot,
  getDailyAttendanceReport,
  getTeacherScheduleReport,
  exportDailyAttendanceExcel,
  exportDailyAttendanceListExcel,
  exportTeacherScheduleExcel,
  getDailyAttendanceMatrixData
};
