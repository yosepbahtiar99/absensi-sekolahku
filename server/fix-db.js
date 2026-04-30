const { sequelize } = require('./models');

async function updateDB() {
  try {
    console.log('🔄 Menyelaraskan database (ALTER mode)...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Database berhasil diselaraskan! Tabel ApprovalRequests sekarang sudah ada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menyelaraskan database:', error);
    process.exit(1);
  }
}

updateDB();
