const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GradeLevel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    sequence: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
};
