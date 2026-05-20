const { sequelize, User, Lesson, Class, Schedule, AcademicYear, TimeSlot, Curriculum, GradeLevel, SystemSetting } = require('./models');
const bcrypt = require('bcryptjs');

async function syncDB() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    console.log('✅ Database terhubung!');

    // Sync semua model (force: true bakal hapus data lama & buat ulang tabel)
    await sequelize.sync({ force: true });
    console.log('✅ Semua tabel berhasil dibuat!');

    // 1. Buat Tahun Ajaran Aktif
    const year = await AcademicYear.create({
      name: '2023/2024 Ganjil',
      startDate: '2023-07-01',
      endDate: '2023-12-31',
      isActive: true
    });
    console.log('✅ Tahun Ajaran Berhasil Dibuat!');

    // 2. Definisi Template Jam Pelajaran
    const timeSlotsData = [
      // SENIN
      { day: 'senin', label: 'Upacara', start: '06:30:00', end: '07:30:00', num: 0 },
      { day: 'senin', label: 'Jam ke-1', start: '07:30:00', end: '08:15:00', num: 1 },
      { day: 'senin', label: 'Jam ke-2', start: '08:15:00', end: '09:00:00', num: 2 },
      { day: 'senin', label: 'Jam ke-3', start: '09:00:00', end: '09:30:00', num: 3 },
      { day: 'senin', label: 'Istirahat', start: '09:30:00', end: '10:15:00', num: 0 },
      { day: 'senin', label: 'Jam ke-4', start: '10:15:00', end: '11:00:00', num: 4 },
      { day: 'senin', label: 'Jam ke-5', start: '11:00:00', end: '11:45:00', num: 5 },

      // SELASA, RABU, KAMIS (Looping)
      ...['selasa', 'rabu', 'kamis'].flatMap(day => [
        { day, label: 'Jam ke-1', start: '07:00:00', end: '07:45:00', num: 1 },
        { day, label: 'Jam ke-2', start: '07:45:00', end: '08:30:00', num: 2 },
        { day, label: 'Jam ke-3', start: '08:30:00', end: '09:15:00', num: 3 },
        { day, label: 'Istirahat', start: '09:15:00', end: '10:00:00', num: 0 },
        { day, label: 'Jam ke-4', start: '10:30:00', end: '11:15:00', num: 4 },
        { day, label: 'Jam ke-5', start: '11:15:00', end: '12:00:00', num: 5 },
      ]),

      // JUMAT
      { day: 'jumat', label: 'Duha Bersama', start: '06:30:00', end: '07:45:00', num: 0 },
      { day: 'jumat', label: 'Jam ke-2', start: '07:45:00', end: '08:30:00', num: 2 },
      { day: 'jumat', label: 'Istirahat', start: '08:30:00', end: '09:15:00', num: 0 },
      { day: 'jumat', label: 'Jam ke-3', start: '09:15:00', end: '10:00:00', num: 3 },
      { day: 'jumat', label: 'Jam ke-4', start: '10:30:00', end: '11:15:00', num: 4 },
    ];

    for (const s of timeSlotsData) {
      await TimeSlot.create({
        academicYearId: year.id,
        day: s.day,
        label: s.label,
        startTime: s.start,
        endTime: s.end,
        periodNumber: s.num
      });
    }
    console.log('✅ Template Jam Pelajaran Sultan Berhasil Dibuat!');

    // 3. Buat Admin Pertama
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    // 4. Buat Guru Contoh
    const hashedPassGuru = await bcrypt.hash('guru123', 10);
    await User.create({
      name: 'Budi Santoso',
      username: 'guru',
      password: hashedPassGuru,
      role: 'guru'
    });

    // 5. Buat Tingkat Kelas (GradeLevel)
    const grades = await GradeLevel.bulkCreate([
      { name: '7', sequence: 7 },
      { name: '8', sequence: 8 },
      { name: '9', sequence: 9 },
      { name: 'X', sequence: 10 },
      { name: 'XI', sequence: 11 },
      { name: 'XII', sequence: 12 }
    ]);
    const grade7 = grades[0];
    const grade10 = grades[3];

    // 6. Buat Data Master Contoh
    const mtk = await Lesson.create({ name: 'Matematika', hours: 6 });
    const indo = await Lesson.create({ name: 'Bahasa Indonesia', hours: 4 });
    await Class.create({ name: 'Kelas VII A', gradeLevelId: grade7.id });

    // 7. Buat Kurikulum
    await Curriculum.create({
      academicYearId: year.id,
      gradeLevelId: grade7.id,
      lessonId: mtk.id,
      requiredHours: 6
    });
    await Curriculum.create({
      academicYearId: year.id,
      gradeLevelId: grade7.id,
      lessonId: indo.id,
      requiredHours: 4
    });
    // 8. Buat Pengaturan Sistem Default
    if (SystemSetting) {
      await SystemSetting.create({ key: 'attendance_flow', value: 'disabled' });
      await SystemSetting.create({ key: 'late_tolerance', value: '15' });
      console.log('✅ Pengaturan Sistem Default Berhasil Dibuat!');
    }

    console.log('✅ Data Master & Kurikulum Berhasil Dibuat!');

    console.log('-----------------------------------');
    console.log('🚀 SELESAI SINKRONISASI!');
    console.log('User Admin: admin / admin123');
    console.log('User Guru: guru / guru123');
    console.log('Tahun Ajaran Aktif: 2023/2024 Ganjil');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal sinkronisasi database:', error);
    process.exit(1);
  }
}

syncDB();
