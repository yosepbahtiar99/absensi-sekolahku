const { 
  sequelize, User, Lesson, Class, Schedule, 
  AcademicYear, TimeSlot, Curriculum, GradeLevel 
} = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedData() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    console.log('✅ Database terhubung!');

    // Load data JSON
    const dataPath = path.join(__dirname, '../data/smp_tunas_baru_ciparay_2025_2026.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`File JSON tidak ditemukan di: ${dataPath}`);
    }
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const schoolData = JSON.parse(rawData);

    const force = process.argv.includes('--force');
    if (force) {
      console.log('⚠️  Menjalankan sinkronisasi ulang database (FORCE: TRUE)...');
      await sequelize.sync({ force: true });
      console.log('✅ Semua tabel dibersihkan dan dibuat ulang!');
    } else {
      console.log('ℹ️  Menyisipkan data secara bertahap tanpa menghapus data lama (Gunakan --force untuk reset total)...');
    }

    // 1. Buat / Ambil Tahun Ajaran
    const [academicYear] = await AcademicYear.findOrCreate({
      where: { name: `${schoolData.academicYear} Ganjil` },
      defaults: {
        startDate: '2025-07-01',
        endDate: '2025-12-31',
        isActive: true
      }
    });
    console.log(`✅ Tahun Ajaran: ${academicYear.name}`);

    // Set tahun ajaran lain menjadi tidak aktif jika tahun ajaran ini aktif
    await AcademicYear.update({ isActive: false }, {
      where: {
        id: { [sequelize.Sequelize.Op.ne]: academicYear.id }
      }
    });

    // 2. Buat Admin jika belum ada
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        name: 'Super Admin',
        password: hashedAdminPassword,
        role: 'admin'
      }
    });
    console.log(`✅ Admin User: ${adminUser.username} (password: admin123)`);

    // 3. Buat Tingkat Kelas (GradeLevel)
    const gradeMap = {};
    for (const gl of schoolData.gradeLevels) {
      const [gradeRecord] = await GradeLevel.findOrCreate({
        where: { name: gl.name },
        defaults: { sequence: gl.sequence }
      });
      gradeMap[gl.name] = gradeRecord.id;
    }
    console.log('✅ Tingkat Kelas (GradeLevel) berhasil disinkronkan!');

    // 4. Buat Kelas (Class)
    const classMap = {};
    for (const cls of schoolData.classes) {
      const [classRecord] = await Class.findOrCreate({
        where: { name: cls.name },
        defaults: { gradeLevelId: gradeMap[cls.grade] }
      });
      // Simpan mapping dari short name (misal "VII A") dan full name (misal "Kelas VII A") ke class ID
      const shortName = cls.name.replace('Kelas ', ''); // "Kelas VII A" -> "VII A"
      classMap[shortName] = classRecord.id;
      classMap[cls.name] = classRecord.id;
    }
    console.log('✅ Kelas (Class) berhasil disinkronkan!');

    // 5. Buat Mata Pelajaran (Lesson)
    // Dapatkan semua pelajaran unik dari list guru
    const lessonMap = {};
    const uniqueLessons = new Set();
    schoolData.teachers.forEach(t => {
      t.subjects.forEach(sub => uniqueLessons.add(sub));
    });

    for (const lessonName of uniqueLessons) {
      // Jam pelajaran per minggu standar (misal Matematika 6 jam, PAI 4 jam, dst)
      let hours = 4;
      if (lessonName.toLowerCase().includes('matematika')) hours = 6;
      if (lessonName.toLowerCase().includes('indonesia')) hours = 4;
      if (lessonName.toLowerCase().includes('ipa')) hours = 5;

      const [lessonRecord] = await Lesson.findOrCreate({
        where: { name: lessonName },
        defaults: { hours }
      });
      lessonMap[lessonName] = lessonRecord.id;
    }
    console.log('✅ Mata Pelajaran (Lesson) berhasil disinkronkan!');

    // 6. Buat Guru (User)
    const teacherMap = {};
    const hashedGuruPassword = await bcrypt.hash('guru123', 10);
    for (const teacher of schoolData.teachers) {
      // Buat username yang bersih berdasarkan nama
      let cleanUsername = teacher.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Hapus spasi dan simbol
        .substring(0, 15);
      
      // Jika kosong atau terlalu pendek, pakai format guru_code
      if (!cleanUsername || cleanUsername.length < 3) {
        cleanUsername = `guru${teacher.code}`;
      }

      // Pastikan username unik
      let finalUsername = cleanUsername;
      let counter = 1;
      while (true) {
        const existingUser = await User.findOne({ where: { username: finalUsername } });
        if (!existingUser) break;
        finalUsername = `${cleanUsername}${counter}`;
        counter++;
      }

      // Buat User Guru
      const [guruRecord] = await User.findOrCreate({
        where: { name: teacher.name },
        defaults: {
          username: finalUsername,
          password: hashedGuruPassword,
          role: 'guru',
          isPhotoRequired: true
        }
      });

      // Simpan mapping dari kode guru (misal 1, 2, "BK") ke record ID
      teacherMap[teacher.code] = guruRecord.id;
      
      // Simpan data kurikulum untuk guru ini
      for (const subjectName of teacher.subjects) {
        const lessonId = lessonMap[subjectName];
        // Buat Kurikulum default untuk setiap grade level jika belum ada
        for (const gradeName of Object.keys(gradeMap)) {
          const gradeLevelId = gradeMap[gradeName];
          await Curriculum.findOrCreate({
            where: {
              academicYearId: academicYear.id,
              gradeLevelId,
              lessonId
            },
            defaults: {
              requiredHours: 4
            }
          });
        }
      }
    }
    console.log('✅ Guru (User) dan Kurikulum berhasil disinkronkan!');

    // 7. Buat Time Slot (Jam Pelajaran) & Schedule
    let timeSlotCount = 0;
    let scheduleCount = 0;

    for (const day of Object.keys(schoolData.scheduleMatrix)) {
      const slots = schoolData.scheduleMatrix[day];
      
      for (const slot of slots) {
        // Buat Time Slot record
        // Format time "07.40-08.20" -> start "07:40:00", end "08:20:00"
        const [startStr, endStr] = slot.time.split('-');
        const formatTime = (timeStr) => {
          const parts = timeStr.trim().split('.');
          if (parts.length === 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
          }
          const colonParts = timeStr.trim().split(':');
          if (colonParts.length === 2) {
            return `${colonParts[0].padStart(2, '0')}:${colonParts[1].padStart(2, '0')}:00`;
          }
          return `${timeStr.trim()}:00`;
        };

        const startTime = formatTime(startStr);
        const endTime = formatTime(endStr);
        const label = slot.isSpecial ? slot.specialLabel : `Jam ke-${slot.period}`;

        const [timeSlotRecord] = await TimeSlot.findOrCreate({
          where: {
            academicYearId: academicYear.id,
            day,
            label,
            startTime,
            endTime
          },
          defaults: {
            periodNumber: slot.period
          }
        });
        timeSlotCount++;

        // Jika bukan slot khusus (Upacara/Istirahat), buat jadwal pelajaran untuk setiap kelas yang terisi
        if (!slot.isSpecial && slot.assignments) {
          for (const [classShortName, teacherCode] of Object.entries(slot.assignments)) {
            const classId = classMap[classShortName];
            const teacherId = teacherMap[teacherCode];
            
            if (classId && teacherId) {
              // Dapatkan info guru untuk mengetahui pelajarannya
              const teacherInfo = schoolData.teachers.find(t => t.code === teacherCode);
              // Gunakan pelajaran pertamanya sebagai mata pelajaran yang dijadwalkan
              const subjectName = teacherInfo && teacherInfo.subjects ? teacherInfo.subjects[0] : null;
              const lessonId = subjectName ? lessonMap[subjectName] : null;

              if (lessonId) {
                // Cek apakah jadwal ini sudah ada
                const [scheduleRecord, created] = await Schedule.findOrCreate({
                  where: {
                    day,
                    classId,
                    timeSlotId: timeSlotRecord.id,
                    academicYearId: academicYear.id
                  },
                  defaults: {
                    teacherId,
                    lessonId,
                    startTime,
                    endTime
                  }
                });

                // Jika sudah ada tapi guru/pelajaran berbeda, update!
                if (!created) {
                  await scheduleRecord.update({
                    teacherId,
                    lessonId,
                    startTime,
                    endTime
                  });
                }
                scheduleCount++;
              }
            }
          }
        }
      }
    }

    console.log(`✅ ${timeSlotCount} Slot Waktu berhasil dibuat!`);
    console.log(`✅ ${scheduleCount} Jadwal Pelajaran (Schedule) berhasil disinkronkan!`);

    console.log('-----------------------------------');
    console.log('🚀 SELESAI SINKRONISASI JADWAL TUNAS BARU CIPARAY!');
    console.log(`Tahun Ajaran Aktif: ${academicYear.name}`);
    console.log('-----------------------------------');
    process.exit(0);

  } catch (error) {
    console.error('❌ Gagal sinkronisasi data sekolah:', error);
    process.exit(1);
  }
}

seedData();
