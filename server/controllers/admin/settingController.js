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

    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pengaturan sistem' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { attendance_flow } = req.body;
    
    if (attendance_flow && !['disabled', 'strict', 'block'].includes(attendance_flow)) {
      return res.status(400).json({ message: 'Aliran absensi tidak valid' });
    }

    if (attendance_flow) {
      await SystemSetting.upsert({
        key: 'attendance_flow',
        value: attendance_flow
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
