const { sequelize } = require('../models');

async function alterTable() {
  try {
    console.log('🔄 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🔄 Altering Activity table for Corporate fields...');
    
    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN corporateCheckIn DATETIME;');
      console.log('✅ Added corporateCheckIn column');
    } catch (e) {
      console.log('⚠️ corporateCheckIn might already exist:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN corporateCheckOut DATETIME;');
      console.log('✅ Added corporateCheckOut column');
    } catch (e) {
      console.log('⚠️ corporateCheckOut might already exist:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN corporateCheckOutLat VARCHAR(255);');
      console.log('✅ Added corporateCheckOutLat column');
    } catch (e) {
      console.log('⚠️ corporateCheckOutLat might already exist:', e.message);
    }

    try {
      await sequelize.query('ALTER TABLE Activities ADD COLUMN corporateCheckOutLong VARCHAR(255);');
      console.log('✅ Added corporateCheckOutLong column');
    } catch (e) {
      console.log('⚠️ corporateCheckOutLong might already exist:', e.message);
    }

    console.log('🚀 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

alterTable();
