const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

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
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'guru'), defaultValue: 'guru' },
});

const Activity = sequelize.define('Activity', {
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
});

const ApprovalRequest = sequelize.define('ApprovalRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: { 
    type: DataTypes.ENUM('custom_pembelajaran', 'koreksi', 'perizinan', 'lembur'),
    allowNull: false
  },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  data: { 
    type: DataTypes.JSON,
    allowNull: false 
  },
  adminNote: { type: DataTypes.STRING },
  approvedAt: { type: DataTypes.DATE },
  approvedBy: { type: DataTypes.UUID },
});

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
});

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  hours: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  day: { type: DataTypes.ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'), allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
});

const Log = sequelize.define('Log', {
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

User.hasMany(ApprovalRequest, { foreignKey: 'userId' });
ApprovalRequest.belongsTo(User, { foreignKey: 'userId' });

ApprovalRequest.belongsTo(Activity, { foreignKey: 'activityId' });
Activity.hasMany(ApprovalRequest, { foreignKey: 'activityId' });

module.exports = { sequelize, User, Activity, Log, Class, Lesson, Schedule, ApprovalRequest };
