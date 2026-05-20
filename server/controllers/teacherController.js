const schedule = require('./teacher/scheduleController');
const attendance = require('./teacher/attendanceController');
const approval = require('./teacher/approvalController');

module.exports = {
  ...schedule,
  ...attendance,
  ...approval
};
