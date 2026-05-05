const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Schedule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    day: { type: DataTypes.ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'), allowNull: false },
    // deprecated: we'll use TimeSlot instead, but keeping for compatibility during migration
    startTime: { type: DataTypes.TIME, allowNull: true },
    endTime: { type: DataTypes.TIME, allowNull: true },
  });
};
