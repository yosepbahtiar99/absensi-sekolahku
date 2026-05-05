const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Lesson', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    hours: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
};
