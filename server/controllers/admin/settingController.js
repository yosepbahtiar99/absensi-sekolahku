const { SystemSetting } = require('../../models');

const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    const config = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    // Set default value if not exists
    if (!config.attendance_flow) {
      config.attendance_flow = 'disabled';
    }
    
    // Parse and set default for late_tolerance
    config.late_tolerance = config.late_tolerance ? parseInt(config.late_tolerance, 10) : 15;

    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pengaturan sistem' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { attendance_flow, late_tolerance } = req.body;
    
    if (attendance_flow && !['disabled', 'strict', 'block'].includes(attendance_flow)) {
      return res.status(400).json({ message: 'Aliran absensi tidak valid' });
    }

    if (late_tolerance !== undefined) {
      const parsedLate = parseInt(late_tolerance, 10);
      if (isNaN(parsedLate) || parsedLate < 0 || parsedLate > 120) {
        return res.status(400).json({ message: 'Toleransi keterlambatan harus berupa angka antara 0 sampai 120 menit' });
      }
    }

    if (attendance_flow) {
      await SystemSetting.upsert({
        key: 'attendance_flow',
        value: attendance_flow
      });
    }

    if (late_tolerance !== undefined) {
      await SystemSetting.upsert({
        key: 'late_tolerance',
        value: String(late_tolerance)
      });
    }

    res.json({ message: 'Pengaturan sistem berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memperbarui pengaturan sistem' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
