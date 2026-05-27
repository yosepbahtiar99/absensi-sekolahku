const fs = require('fs');
const pathModule = require('path');
const path = pathModule.join(__dirname, '../controllers/adminController.js');
let content = fs.readFileSync(path, 'utf8');

// 1. Add GradeLevel to imports
if (!content.includes('GradeLevel')) {
    content = content.replace(
        /const \{ ([\s\S]*?) \} = require\('\.\.\/models'\);/,
        "const { $1, GradeLevel } = require('../models');"
    );
}

// 2. Update getClasses to include GradeLevel
content = content.replace(
    /const \{ count, rows \} = await Class\.findAndCountAll\(\{[\s\S]*?where,[\s\S]*?limit,[\s\S]*?offset,[\s\S]*?order: \[\['name', 'ASC'\]\][\s\S]*?\}\);/,
    `const { count, rows } = await Class.findAndCountAll({
      where,
      limit,
      offset,
      include: [{ model: GradeLevel, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });`
);

// 3. Update createClass & updateClass to handle gradeLevelId
content = content.replace(
    /const \{ name, gradeLevel \} = req\.body;[\s\S]*?await Class\.create\(\{ name, gradeLevel \}\);/,
    `const { name, gradeLevelId } = req.body;
    const cls = await Class.create({ name, gradeLevelId });`
);
content = content.replace(
    /const \{ name, gradeLevel \} = req\.body;[\s\S]*?await Class\.update\(\{ name, gradeLevel \}/,
    `const { name, gradeLevelId } = req.body;
    await Class.update({ name, gradeLevelId }`
);

// 4. Update getCurriculums and createCurriculum to use gradeLevelId
content = content.replace(
    /const \{ academicYearId, gradeLevel \} = req\.query;/,
    "const { academicYearId, gradeLevelId } = req.query;"
);
content = content.replace(
    /if \(gradeLevel\) where\.gradeLevel = gradeLevel;/,
    "if (gradeLevelId) where.gradeLevelId = gradeLevelId;"
);
content = content.replace(
    /include: \[[\s\S]*?\{ model: Lesson, attributes: \['id', 'name'\] \},[\s\S]*?\{ model: AcademicYear, attributes: \['id', 'name'\] \}[\s\S]*?\],/,
    `include: [
        { model: Lesson, attributes: ['id', 'name'] },
        { model: AcademicYear, attributes: ['id', 'name'] },
        { model: GradeLevel, attributes: ['id', 'name'] }
      ],`
);
content = content.replace(
    /order: \[\['gradeLevel', 'ASC'\]\]/,
    "order: [[GradeLevel, 'sequence', 'ASC']]"
);

content = content.replace(
    /const \{ academicYearId, gradeLevel, lessonId, requiredHours \} = req\.body;/,
    "const { academicYearId, gradeLevelId, lessonId, requiredHours } = req.body;"
);
content = content.replace(
    /where: \{ academicYearId, gradeLevel, lessonId \}/,
    "where: { academicYearId, gradeLevelId, lessonId }"
);
content = content.replace(
    /await Curriculum\.create\(\{ academicYearId, gradeLevel, lessonId, requiredHours \}\);/,
    "await Curriculum.create({ academicYearId, gradeLevelId, lessonId, requiredHours });"
);

// 5. Add GradeLevel CRUD controllers
const gradeLevelControllers = `
// --- GRADE LEVEL CRUD ---
const getGradeLevels = async (req, res) => {
  try {
    const grades = await GradeLevel.findAll({ order: [['sequence', 'ASC'], ['name', 'ASC']] });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data tingkat' });
  }
};

const createGradeLevel = async (req, res) => {
  try {
    const { name, sequence } = req.body;
    const grade = await GradeLevel.create({ name, sequence });
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: 'Gagal tambah tingkat' });
  }
};

const updateGradeLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sequence } = req.body;
    await GradeLevel.update({ name, sequence }, { where: { id } });
    res.json({ message: 'Tingkat berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update tingkat' });
  }
};

const deleteGradeLevel = async (req, res) => {
  try {
    await GradeLevel.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Tingkat berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus tingkat' });
  }
};
`;

content = content.replace('// --- CURRICULUM CRUD ---', gradeLevelControllers + '\n// --- CURRICULUM CRUD ---');

// 6. Update Exports
if (!content.includes('getGradeLevels')) {
    content = content.replace(
        '  getCurriculums, createCurriculum, updateCurriculum, deleteCurriculum,',
        '  getCurriculums, createCurriculum, updateCurriculum, deleteCurriculum,\n  getGradeLevels, createGradeLevel, updateGradeLevel, deleteGradeLevel,'
    );
}

fs.writeFileSync(path, content);
console.log('Successfully updated adminController.js with GradeLevel logic');
