const fs = require('fs');
const path = 'c:/Users/PT-DIKA/Source/yosep/absensi-sekolahku/server/controllers/adminController.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update createClass and updateClass
content = content.replace(
  /const createClass = async \(req, res\) => \{[\s\S]*?await Class\.create\(req\.body\);[\s\S]*?\};/,
  `const createClass = async (req, res) => {
  try {
    const { name, gradeLevel } = req.body;
    const cls = await Class.create({ name, gradeLevel });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kelas' });
  }
};`
);

content = content.replace(
  /const updateClass = async \(req, res\) => \{[\s\S]*?await Class\.update\(req\.body, \{ where: \{ id: req\.params\.id \} \}\);[\s\S]*?\};/,
  `const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gradeLevel } = req.body;
    await Class.update({ name, gradeLevel }, { where: { id } });
    res.json({ message: 'Kelas berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kelas' });
  }
};`
);

// 2. Add Curriculum controllers before SCHEDULE CRUD
const curriculumControllers = `
// --- CURRICULUM CRUD ---
const getCurriculums = async (req, res) => {
  try {
    const { academicYearId, gradeLevel } = req.query;
    const where = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeLevel) where.gradeLevel = gradeLevel;

    const curriculums = await Curriculum.findAll({
      where,
      include: [
        { model: Lesson, attributes: ['id', 'name'] },
        { model: AcademicYear, attributes: ['id', 'name'] }
      ],
      order: [['gradeLevel', 'ASC']]
    });
    res.json(curriculums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data kurikulum' });
  }
};

const createCurriculum = async (req, res) => {
  try {
    const { academicYearId, gradeLevel, lessonId, requiredHours } = req.body;
    
    // Check if mapping already exists
    const existing = await Curriculum.findOne({
      where: { academicYearId, gradeLevel, lessonId }
    });
    if (existing) return res.status(400).json({ message: 'Mapel sudah terdaftar di kurikulum tingkat ini' });

    const curriculum = await Curriculum.create({ academicYearId, gradeLevel, lessonId, requiredHours });
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah kurikulum' });
  }
};

const updateCurriculum = async (req, res) => {
  try {
    const { id } = req.params;
    const { requiredHours } = req.body;
    await Curriculum.update({ requiredHours }, { where: { id } });
    res.json({ message: 'Kurikulum berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update kurikulum' });
  }
};

const deleteCurriculum = async (req, res) => {
  try {
    await Curriculum.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Kurikulum berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus kurikulum' });
  }
};
`;

content = content.replace('// --- SCHEDULE CRUD & LOGIC ---', curriculumControllers + '\n// --- SCHEDULE CRUD & LOGIC ---');

// 3. Update Exports
content = content.replace(
  'getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot,',
  'getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot,\n  getCurriculums, createCurriculum, updateCurriculum, deleteCurriculum,'
);

fs.writeFileSync(path, content);
console.log('Successfully updated adminController.js');
