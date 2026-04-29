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

const Class = sequelize.define('Class', {
  name: { type: DataTypes.STRING, allowNull: false },
});

const Lesson = sequelize.define('Lesson', {
  name: { type: DataTypes.STRING, allowNull: false },
});

const Schedule = sequelize.define('Schedule', {
  day: { type: DataTypes.ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'), allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
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
User.hasMany(Schedule, { foreignKey: 'teacherId' });
Schedule.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

Class.hasMany(Schedule, { foreignKey: 'classId' });
Schedule.belongsTo(Class, { foreignKey: 'classId' });

Lesson.hasMany(Schedule, { foreignKey: 'lessonId' });
Schedule.belongsTo(Lesson, { foreignKey: 'lessonId' });

Schedule.hasMany(Activity, { foreignKey: 'scheduleId' });
Activity.belongsTo(Schedule, { foreignKey: 'scheduleId' });

User.hasMany(Activity, { foreignKey: 'userId' });
Activity.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Activity, Log, Class, Lesson, Schedule };
