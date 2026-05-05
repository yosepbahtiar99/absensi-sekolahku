const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Curriculum', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requiredHours: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
};
