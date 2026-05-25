const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

const db = {};

// Load all models in the directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Setup Relationships
const { 
  User, Activity, Class, Lesson, Schedule, 
  ApprovalRequest, AcademicYear, TimeSlot, 
  Curriculum, GradeLevel, DailyAttendance
} = db;

// Relationships
if (User && Schedule) {
  User.hasMany(Schedule, { foreignKey: 'teacherId' });
  Schedule.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
}

if (Class && Schedule) {
  Class.hasMany(Schedule, { foreignKey: 'classId' });
  Schedule.belongsTo(Class, { foreignKey: 'classId' });
}

if (Lesson && Schedule) {
  Lesson.hasMany(Schedule, { foreignKey: 'lessonId' });
  Schedule.belongsTo(Lesson, { foreignKey: 'lessonId' });
}

if (Schedule && Activity) {
  Schedule.hasMany(Activity, { foreignKey: 'scheduleId' });
  Activity.belongsTo(Schedule, { foreignKey: 'scheduleId' });
}

if (User && Activity) {
  User.hasMany(Activity, { foreignKey: 'userId' });
  Activity.belongsTo(User, { foreignKey: 'userId' });
}

if (User && DailyAttendance) {
  User.hasMany(DailyAttendance, { foreignKey: 'userId' });
  DailyAttendance.belongsTo(User, { as: 'user', foreignKey: 'userId' });
}

if (DailyAttendance && Activity) {
  DailyAttendance.hasMany(Activity, { foreignKey: 'dailyAttendanceId' });
  Activity.belongsTo(DailyAttendance, { foreignKey: 'dailyAttendanceId' });
}

if (User && ApprovalRequest) {
  User.hasMany(ApprovalRequest, { foreignKey: 'userId' });
  ApprovalRequest.belongsTo(User, { foreignKey: 'userId' });
}

if (ApprovalRequest && Activity) {
  ApprovalRequest.belongsTo(Activity, { foreignKey: 'activityId' });
  Activity.hasMany(ApprovalRequest, { foreignKey: 'activityId' });
}

// Academic Year & TimeSlot Relationships
if (AcademicYear && TimeSlot) {
  AcademicYear.hasMany(TimeSlot, { foreignKey: 'academicYearId' });
  TimeSlot.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });
}

if (AcademicYear && Schedule) {
  AcademicYear.hasMany(Schedule, { foreignKey: 'academicYearId' });
  Schedule.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });
}

if (AcademicYear && Activity) {
  AcademicYear.hasMany(Activity, { foreignKey: 'academicYearId' });
  Activity.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });
}

if (TimeSlot && Schedule) {
  TimeSlot.hasMany(Schedule, { foreignKey: 'timeSlotId' });
  Schedule.belongsTo(TimeSlot, { foreignKey: 'timeSlotId' });
}

// Curriculum Relationships
if (AcademicYear && Curriculum) {
  AcademicYear.hasMany(Curriculum, { foreignKey: 'academicYearId' });
  Curriculum.belongsTo(AcademicYear, { foreignKey: 'academicYearId' });
}

if (Lesson && Curriculum) {
  Lesson.hasMany(Curriculum, { foreignKey: 'lessonId' });
  Curriculum.belongsTo(Lesson, { foreignKey: 'lessonId' });
}

// GradeLevel Relationships
if (GradeLevel && Class) {
  GradeLevel.hasMany(Class, { foreignKey: 'gradeLevelId' });
  Class.belongsTo(GradeLevel, { foreignKey: 'gradeLevelId' });
}

if (GradeLevel && Curriculum) {
  GradeLevel.hasMany(Curriculum, { foreignKey: 'gradeLevelId' });
  Curriculum.belongsTo(GradeLevel, { foreignKey: 'gradeLevelId' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
