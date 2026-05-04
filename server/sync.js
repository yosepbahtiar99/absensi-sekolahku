const { sequelize, User, Lesson, Class, Schedule, AcademicYear, TimeSlot } = require('./models');
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

    // 2. Buat Template Jam Pelajaran (Time Slots) untuk Senin
    const slots = [
      { label: 'Jam ke-1', start: '07:30:00', end: '08:15:00', num: 1 },
      { label: 'Jam ke-2', start: '08:15:00', end: '09:00:00', num: 2 },
      { label: 'Istirahat', start: '09:00:00', end: '09:30:00', num: 0 },
      { label: 'Jam ke-3', start: '09:30:00', end: '10:15:00', num: 3 },
      { label: 'Jam ke-4', start: '10:15:00', end: '11:00:00', num: 4 },
    ];

    for (const s of slots) {
      await TimeSlot.create({
        academicYearId: year.id,
        day: 'senin',
        label: s.label,
        startTime: s.start,
        endTime: s.end,
        periodNumber: s.num
      });
    }
    console.log('✅ Template Jam Pelajaran (Senin) Berhasil Dibuat!');

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
    const guru = await User.create({
      name: 'Pak Budi Santoso',
      username: 'guru',
      password: hashedPassGuru,
      role: 'guru'
    });

    // 5. Buat Data Master Contoh
    const mapel = await Lesson.create({ name: 'Bahasa Indonesia', hours: 4 });
    const kelasA = await Class.create({ name: 'Kelas VII A' });

    // 6. Ambil Slot Jam ke-1 untuk Jadwal Contoh
    const slot1 = await TimeSlot.findOne({ where: { label: 'Jam ke-1', day: 'senin' } });

    await Schedule.create({
      day: 'senin',
      academicYearId: year.id,
      timeSlotId: slot1.id,
      teacherId: guru.id,
      lessonId: mapel.id,
      classId: kelasA.id
    });

    console.log('-----------------------------------');
    console.log('🚀 SELESAI!');
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
