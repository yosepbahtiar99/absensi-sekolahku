const { sequelize, DailyAttendance } = require('../models');

async function syncTable() {
  try {
    console.log('🔄 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🔄 Syncing DailyAttendances table...');
    await DailyAttendance.sync({ alter: true });
    console.log('✅ Synced DailyAttendances.');

    console.log('🚀 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncTable();
