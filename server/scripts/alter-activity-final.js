const { sequelize } = require('../models');

async function alterTable() {
  try {
    console.log('🔄 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🔄 Altering Activity table for final corporate flow schema...');
    
    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN dailyAttendanceId CHAR(36) NULL;');
      console.log('✅ Added dailyAttendanceId column');
    } catch (e) {
      console.log('⚠️ dailyAttendanceId might already exist:', e.message);
    }

    try {
      // Modify ENUM to include 'alpa' and 'izin' if missing
      await sequelize.query("ALTER TABLE Activities MODIFY COLUMN status ENUM('masuk','telat','tidak_hadir','alpa','izin') NULL;");
      console.log('✅ Modified status ENUM to include alpa and izin');
    } catch (e) {
      console.log('⚠️ Failed to modify status ENUM:', e.message);
    }

    console.log('🚀 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

alterTable();
