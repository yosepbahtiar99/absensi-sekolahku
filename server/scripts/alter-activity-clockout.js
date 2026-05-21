const { sequelize } = require('../models');

async function alterTable() {
  try {
    console.log('🔄 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🔄 Altering Activity table...');
    // We will just try to add the columns. If they exist, it might throw, so we catch individual errors or use raw query.
    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN isApproveCheckOut BOOLEAN DEFAULT false;');
      console.log('✅ Added isApproveCheckOut column');
    } catch (e) {
      console.log('⚠️ isApproveCheckOut might already exist:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN clockOutTime DATETIME;');
      console.log('✅ Added clockOutTime column');
    } catch (e) {
      console.log('⚠️ clockOutTime might already exist:', e.message);
    }

    console.log('🚀 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

alterTable();
