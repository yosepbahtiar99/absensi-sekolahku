module.exports = (sequelize, DataTypes) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'system_settings',
    timestamps: true
  });

  return SystemSetting;
};
