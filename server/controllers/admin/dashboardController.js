const { User, Class, Lesson, Activity, AcademicYear } = require('../../models');
const { Op } = require('sequelize');

const getDashboardSummary = async (req, res) => {
  try {
    const { academicYearId } = req.query;
    let targetYearId = academicYearId;
    let activeYear = null;

    if (!targetYearId) {
      activeYear = await AcademicYear.findOne({ where: { isActive: true } });
      targetYearId = activeYear?.id;
    } else {
      activeYear = await AcademicYear.findByPk(targetYearId);
    }

    const yearWhere = targetYearId ? { academicYearId: targetYearId } : {};

    const totalGuru = await User.count({ where: { role: 'guru' } });
    const totalKelas = await Class.count();
    const totalPelajaran = await Lesson.count();

    const today = new Date().setHours(0,0,0,0);
    const totalHadir = await Activity.count({
      where: {
        ...yearWhere,
        timestamp: { [Op.gte]: today },
        status: 'masuk'
      }
    });
    
    const totalTelat = await Activity.count({
      where: {
        ...yearWhere,
        timestamp: { [Op.gte]: today },
        status: 'telat'
      }
    });

    res.json({
      totalGuru,
      totalKelas,
      totalPelajaran,
      activeYear: activeYear?.name,
      todayStats: {
        hadir: totalHadir,
        telat: totalTelat
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil ringkasan dashboard' });
  }
};

module.exports = {
  getDashboardSummary
};
