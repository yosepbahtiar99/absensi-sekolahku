const { sequelize, User, Lesson, Class, Schedule } = require('./models');
const bcrypt = require('bcryptjs');

async function syncDB() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    console.log('✅ Database terhubung!');

    // Sync semua model (force: true bakal hapus data lama & buat ulang tabel)
    await sequelize.sync({ force: true });
    console.log('✅ Semua tabel berhasil dibuat!');

    // Buat Admin Pertama
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    // Buat Guru Contoh
    const hashedPassGuru = await bcrypt.hash('guru123', 10);
    const guru = await User.create({
      name: 'Pak Budi Santoso',
      username: 'guru',
      password: hashedPassGuru,
      role: 'guru'
    });

    // Buat Data Master Contoh
    const mapel = await Lesson.create({ name: 'Bahasa Indonesia' });
    const kelasA = await Class.create({ name: 'Kelas VII A' });
    const kelasB = await Class.create({ name: 'Kelas VIII B' });

    // Buat Jadwal Contoh buat Hari Ini
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const todayName = days[new Date().getDay()];

    await Schedule.create({
      day: todayName,
      startTime: '07:00:00',
      endTime: '12:00:00',
      teacherId: guru.id,
      lessonId: mapel.id,
      classId: kelasA.id
    });

    await Schedule.create({
      day: todayName,
      startTime: '13:00:00',
      endTime: '15:00:00',
      teacherId: guru.id,
      lessonId: mapel.id,
      classId: kelasB.id
    });

    console.log('-----------------------------------');
    console.log('🚀 SELESAI!');
    console.log('User Admin: admin / admin123');
    console.log('User Guru: guru / guru123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal sinkronisasi database:', error);
    process.exit(1);
  }
}

syncDB();
