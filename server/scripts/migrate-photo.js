const { sequelize } = require('../models');
const { DataTypes } = require('sequelize');

async function migrate() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    console.log('✅ Database terhubung!');

    const queryInterface = sequelize.getQueryInterface();

    console.log('🔄 Mengecek struktur tabel Users...');
    const tableDesc = await queryInterface.describeTable('Users');
    
    if (tableDesc.photoId) {
      console.log('✅ Kolom photoId sudah ada di tabel Users. Tidak perlu migrasi.');
      process.exit(0);
    }

    console.log('🔄 Menambahkan kolom photoId ke tabel Users...');
    await queryInterface.addColumn('Users', 'photoId', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    console.log('✅ Berhasil! Kolom photoId sukses ditambahkan ke tabel Users.');
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('Duplicate column name')) {
      console.log('✅ Kolom photoId sudah ada di tabel Users.');
      process.exit(0);
    } else {
      console.error('❌ Gagal melakukan migrasi:', error);
      process.exit(1);
    }
  }
}

migrate();
