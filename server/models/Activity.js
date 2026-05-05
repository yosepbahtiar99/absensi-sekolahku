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
    status: { type: DataTypes.ENUM('masuk', 'telat', 'tidak_hadir') },
    isCustom: { type: DataTypes.BOOLEAN, defaultValue: false },
    description: { type: DataTypes.TEXT },
    // Snapshot Data for History Integrity
    snapshotClassName: { type: DataTypes.STRING },
    snapshotLessonName: { type: DataTypes.STRING },
    snapshotTeacherName: { type: DataTypes.STRING },
  });
};
