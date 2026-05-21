const { User, Class, Lesson, Schedule, TimeSlot, AcademicYear, Curriculum } = require('../../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

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
        { model: Lesson, attributes: ['id', 'name', 'hours'] },
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

    // 0. Proteksi Kunci Jadwal (Database Lock Check)
    const year = await AcademicYear.findByPk(academicYearId);
    if (year && year.isLocked) {
      return res.status(400).json({ message: 'Jadwal untuk tahun ajaran ini sedang dikunci!' });
    }

    let finalId = id;
    if (!finalId) {
      const existingSlot = await Schedule.findOne({
        where: { day, academicYearId, timeSlotId, classId }
      });
      if (existingSlot) finalId = existingSlot.id;
    }

    // 1. Validasi Overlap Guru
    const teacherConflict = await Schedule.findOne({
      where: {
        day,
        academicYearId,
        timeSlotId,
        teacherId,
        id: { [Op.ne]: finalId || 0 }
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
        id: { [Op.ne]: finalId || 0 }
      }
    });
    if (classConflict) return res.status(400).json({ message: 'Kelas sudah ada pelajaran lain di slot jam tersebut' });

    // 3. Validasi Kuota Kurikulum (JP)
    const targetClass = await Class.findByPk(classId);
    const curriculum = await Curriculum.findOne({
      where: {
        academicYearId,
        gradeLevelId: targetClass?.gradeLevelId,
        lessonId
      }
    });

    if (curriculum) {
      const currentUsage = await Schedule.count({
        where: {
          academicYearId,
          classId,
          lessonId,
          id: { [Op.ne]: finalId || 0 }
        }
      });

      if (currentUsage >= curriculum.requiredHours) {
        return res.status(400).json({ 
          message: `Kuota jam pelajaran ${targetClass.name} untuk mapel ini sudah habis (${curriculum.requiredHours} JP)` 
        });
      }
    }

    const data = { day, academicYearId, timeSlotId, teacherId, classId, lessonId };

    if (finalId) {
      await Schedule.update(data, { where: { id: finalId } });
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
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    if (schedule) {
      const year = await AcademicYear.findByPk(schedule.academicYearId);
      if (year && year.isLocked) {
        return res.status(400).json({ message: 'Jadwal untuk tahun ajaran ini sedang dikunci!' });
      }
    }
    await Schedule.destroy({ where: { id } });
    res.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus jadwal' });
  }
};

const exportSchedule = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    if (!academicYearId) return res.status(400).json({ message: 'Tahun ajaran harus dipilih' });

    const year = await AcademicYear.findByPk(academicYearId);
    const classes = await Class.findAll({ order: [['name', 'ASC']] });
    const timeSlots = await TimeSlot.findAll({ 
      where: { academicYearId },
      order: [['startTime', 'ASC']] 
    });
    const schedules = await Schedule.findAll({
      where: { academicYearId },
      include: [
        { model: User, as: 'teacher', attributes: ['name'] },
        { model: Lesson, attributes: ['name'] }
      ]
    });

    const workbook = new ExcelJS.Workbook();
    
    // Bikin dinamis berdasarkan TimeSlot yang ada, diurutkan sesuai urutan hari
    const dayOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
    const days = [...new Set(timeSlots.map(ts => ts.day.toLowerCase()))]
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    // 1. Group time slots by day and sort them chronologically
    const slotsPerDay = {};
    days.forEach(day => {
      slotsPerDay[day] = timeSlots
        .filter(ts => ts.day === day)
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

    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    for (const cls of classes) {
      const sheet = workbook.addWorksheet(cls.name.replace(/[\\\/\?\*\[\]]/g, '')); // Clean sheet name

      if (groups.length === 0) {
        sheet.mergeCells('A1:C1');
        const emptyCell = sheet.getCell('A1');
        emptyCell.value = `BELUM ADA JADWAL - ${cls.name}`;
        emptyCell.font = { bold: true, size: 14 };
        emptyCell.alignment = { horizontal: 'center' };
        continue;
      }

      // 4. Calculate total spanning columns for the main titles
      let totalColumns = 0;
      groups.forEach((group, idx) => {
        totalColumns += 1 + group.days.length; // 1 (Waktu) + list of days
        if (idx < groups.length - 1) {
          totalColumns += 1; // 1 (Spacer column)
        }
      });

      // 5. Main Title Header
      sheet.mergeCells(1, 1, 1, totalColumns);
      const titleCell = sheet.getCell(1, 1);
      titleCell.value = `JADWAL PELAJARAN - ${cls.name}`;
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells(2, 1, 2, totalColumns);
      const subTitleCell = sheet.getCell(2, 1);
      subTitleCell.value = `TAHUN AJARAN: ${year?.name || '-'}`;
      subTitleCell.font = { bold: true, size: 11 };
      subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.getRow(1).height = 25;
      sheet.getRow(2).height = 20;

      // 6. Render table groups horizontally
      let currentCol = 1;

      groups.forEach((group) => {
        const startCol = currentCol;

        // --- A. Render Headers ---
        const headerRow = sheet.getRow(4);
        
        // Time Header
        const timeHeaderCell = headerRow.getCell(startCol);
        timeHeaderCell.value = 'Waktu';
        sheet.getColumn(startCol).width = 18;

        // Days Headers
        group.days.forEach((day, dIdx) => {
          const dayCol = startCol + 1 + dIdx;
          const dayHeaderCell = headerRow.getCell(dayCol);
          dayHeaderCell.value = capitalize(day);
          sheet.getColumn(dayCol).width = 24;
        });

        // Apply Table Header Styles (Cyan theme)
        for (let c = startCol; c < startCol + 1 + group.days.length; c++) {
          const cell = headerRow.getCell(c);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };
        }

        // --- B. Render Rows & Data ---
        group.slots.forEach((slot, sIdx) => {
          const rowIdx = 5 + sIdx;
          const row = sheet.getRow(rowIdx);
          row.height = 35; // Comfortable row height for wrapped teacher names

          // Waktu Cell
          const timeStr = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
          const timeCell = row.getCell(startCol);
          timeCell.value = timeStr;
          timeCell.font = { bold: true, size: 9 };
          timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
          timeCell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          };

          // Schedule for each Day
          group.days.forEach((day, dIdx) => {
            const dayCol = startCol + 1 + dIdx;
            const cell = row.getCell(dayCol);

            // Locate slot record corresponding specifically to this day with the same interval
            const dayTimeSlots = slotsPerDay[day];
            const actualSlot = dayTimeSlots.find(ts => 
              ts.startTime.substring(0, 5) === slot.startTime.substring(0, 5) && 
              ts.endTime.substring(0, 5) === slot.endTime.substring(0, 5)
            );

            cell.border = {
              top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
            };
            cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };

            if (actualSlot) {
              const sched = schedules.find(s => s.classId === cls.id && s.timeSlotId === actualSlot.id && s.day === day);
              
              if (sched) {
                cell.value = `${sched.Lesson?.name}\n(${sched.teacher?.name})`;
                cell.font = { size: 9 };
              } else {
                // Handle custom labels like "Istirahat", "Upacara"
                if (actualSlot.label && actualSlot.label.toLowerCase() !== 'jam ke-' && !actualSlot.label.startsWith('Jam ke')) {
                  cell.value = actualSlot.label;
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
                  cell.font = { italic: true, size: 8, color: { argb: 'FF64748B' } };
                }
              }
            }
          });
        });

        // --- C. Apply Vertical Merging for Consecutive Matching Lessons ---
        group.days.forEach((day, dIdx) => {
          const dayCol = startCol + 1 + dIdx;
          const startRow = 5;
          const endRow = 5 + group.slots.length - 1;

          let mergeStart = startRow;
          for (let r = startRow; r <= endRow; r++) {
            const currentVal = sheet.getCell(r, dayCol).value;
            const nextVal = (r < endRow) ? sheet.getCell(r + 1, dayCol).value : null;

            // Merge logic: same cell value, non-empty
            if (currentVal && currentVal === nextVal) {
              // Keep grouping the block
            } else {
              if (r > mergeStart) {
                sheet.mergeCells(mergeStart, dayCol, r, dayCol);
                
                // Secure styles on the newly merged block
                for (let mr = mergeStart; mr <= r; mr++) {
                  const mCell = sheet.getCell(mr, dayCol);
                  mCell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                  };
                  mCell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
                }
              }
              mergeStart = r + 1;
            }
          }
        });

        // Move pointer past the current group
        currentCol += 1 + group.days.length;

        // Insert small spacer column between group blocks
        sheet.mergeCells(4, currentCol, 4 + group.slots.length, currentCol); // Optional cell merge for spacer
        sheet.getColumn(currentCol).width = 4;
        currentCol += 1; 
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officialdocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Jadwal_Pelajaran_${year?.name.replace(/ /g, '_')}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal export jadwal' });
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
    let newTimeSlots = await TimeSlot.findAll({
      where: { academicYearId: toYearId }
    });

    // Jika tahun tujuan belum memiliki jam pelajaran (time slots) sama sekali,
    // otomatis copy semua jam pelajaran dari tahun asal terlebih dahulu
    if (newTimeSlots.length === 0) {
      const oldTimeSlots = await TimeSlot.findAll({
        where: { academicYearId: fromYearId }
      });
      if (oldTimeSlots.length > 0) {
        newTimeSlots = await TimeSlot.bulkCreate(
          oldTimeSlots.map(ts => ({
            academicYearId: toYearId,
            day: ts.day,
            label: ts.label,
            startTime: ts.startTime,
            endTime: ts.endTime,
            periodNumber: ts.periodNumber,
            isBreak: ts.isBreak
          })),
          { returning: true }
        );
      }
    }

    // 3. Mapping logic
    const newSchedules = [];
    for (const oldSched of oldSchedules) {
      // Cari slot yang cocok (berdasarkan hari dan nomor periode/label/waktu)
      const matchingSlot = newTimeSlots.find(ts => 
        ts.day === oldSched.day && 
        (
          (oldSched.TimeSlot && ts.periodNumber === oldSched.TimeSlot.periodNumber) || 
          (oldSched.TimeSlot && ts.label === oldSched.TimeSlot.label) ||
          (oldSched.TimeSlot && ts.startTime === oldSched.TimeSlot.startTime && ts.endTime === oldSched.TimeSlot.endTime)
        )
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

    // Hapus jadwal tahun tujuan yang sudah ada untuk menghindari bentrok duplikasi
    await Schedule.destroy({ where: { academicYearId: toYearId } });

    // 4. Bulk Create
    await Schedule.bulkCreate(newSchedules);

    res.json({ message: `Berhasil meng-copy ${newSchedules.length} jadwal` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal meng-cloning jadwal' });
  }
};

module.exports = {
  getSchedules,
  createOrUpdateSchedule,
  deleteSchedule,
  exportSchedule,
  cloneSchedule
};
