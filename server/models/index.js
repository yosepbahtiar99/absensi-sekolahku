const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'guru'), defaultValue: 'guru' },
});

const Activity = sequelize.define('Activity', {
  type: { type: DataTypes.STRING, defaultValue: 'pembelajaran' }, // 'pembelajaran', 'pembelajaran custom'
  photoSelfie: { type: DataTypes.STRING },
  photoClass: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('masuk', 'telat', 'tidak_hadir') },
  isCustom: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const Log = sequelize.define('Log', {
  action: { type: DataTypes.STRING }, // 'create', 'update', 'delete'
  tableName: { type: DataTypes.STRING },
  dataId: { type: DataTypes.INTEGER },
  oldData: { type: DataTypes.JSON },
  newData: { type: DataTypes.JSON },
  changedBy: { type: DataTypes.INTEGER },
});

// Relationships
// ... (Add later)

module.exports = { sequelize, User, Activity, Log };
