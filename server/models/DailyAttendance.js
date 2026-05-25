const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('DailyAttendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkOutLat: {
      type: DataTypes.STRING,
      allowNull: true
    },
    checkOutLong: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('hadir', 'izin', 'sakit', 'alpa'),
      defaultValue: 'hadir'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
};
