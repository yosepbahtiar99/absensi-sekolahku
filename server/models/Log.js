const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Log', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    action: { type: DataTypes.STRING }, // 'create', 'update', 'delete'
    tableName: { type: DataTypes.STRING },
    dataId: { type: DataTypes.STRING }, // Pake string karena dataId nampung UUID
    oldData: { type: DataTypes.JSON },
    newData: { type: DataTypes.JSON },
    changedBy: { type: DataTypes.UUID }, // Refer ke User.id (UUID)
  });
};
