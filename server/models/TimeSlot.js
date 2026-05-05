const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TimeSlot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    day: { 
      type: DataTypes.ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'), 
      allowNull: false 
    },
    label: { type: DataTypes.STRING, allowNull: false }, // e.g., "Jam ke-1"
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    periodNumber: { type: DataTypes.INTEGER },
  });
};
