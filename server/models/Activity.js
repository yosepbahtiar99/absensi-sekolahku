const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Activity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: { type: DataTypes.STRING, defaultValue: 'pembelajaran' }, // 'pembelajaran', 'pembelajaran custom', 'lembur'
    photoSelfie: { type: DataTypes.STRING },
    photoClass: { type: DataTypes.STRING },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('masuk', 'telat', 'tidak_hadir', 'alpa') },
    isCustom: { type: DataTypes.BOOLEAN, defaultValue: false },
    description: { type: DataTypes.TEXT },
    // Snapshot Data for History Integrity
    snapshotClassName: { type: DataTypes.STRING },
    snapshotLessonName: { type: DataTypes.STRING },
    snapshotTeacherName: { type: DataTypes.STRING },
    // Corporate Full Day Check Out Logic
    isApproveCheckOut: { type: DataTypes.BOOLEAN, defaultValue: false },
    clockOutTime: { type: DataTypes.DATE },
    // Corporate Specific Tracking Fields
    corporateCheckIn: { type: DataTypes.DATE },
    corporateCheckOut: { type: DataTypes.DATE },
    corporateCheckOutLat: { type: DataTypes.STRING },
    corporateCheckOutLong: { type: DataTypes.STRING },
    dailyAttendanceId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  });
};
