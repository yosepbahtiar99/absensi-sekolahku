const dashboard = require('./admin/dashboardController');
const master = require('./admin/masterController');
const schedule = require('./admin/scheduleController');
const report = require('./admin/reportController');
const approval = require('./admin/approvalController');

module.exports = {
  ...dashboard,
  ...master,
  ...schedule,
  ...report,
  ...approval
};
