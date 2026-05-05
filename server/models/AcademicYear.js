const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AcademicYear', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false }, // e.g., "2023/2024 Ganjil"
    startDate: { type: DataTypes.DATEONLY },
    endDate: { type: DataTypes.DATEONLY },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
};
