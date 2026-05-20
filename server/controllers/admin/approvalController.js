const { User, Class, Lesson, Schedule, Activity, ApprovalRequest, AcademicYear } = require('../../models');
const { Op } = require('sequelize');

const getApprovalRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, type } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows } = await ApprovalRequest.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['name'] },
        { 
          model: Activity, 
          include: [
            { 
              model: Schedule,
              include: [
                { model: Class, attributes: ['name'] },
                { model: Lesson, attributes: ['name'] }
              ]
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body; // 'approved' or 'rejected'
    const adminId = req.user.id;

    const request = await ApprovalRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });

    if (status === 'approved') {
      const payload = request.data;
      const activeYear = await AcademicYear.findOne({ where: { isActive: true } });

      if (request.type === 'koreksi') {
        // Update activity timestamp
        await Activity.update(
          { timestamp: payload.requestedTimestamp },
          { where: { id: request.activityId } }
        );
      } else if (request.type === 'custom_pembelajaran') {
        // Create new activity for custom lesson
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'pembelajaran custom',
          isCustom: true,
          photoSelfie: payload.photoSelfie,
          photoClass: payload.photoClass,
          timestamp: new Date(),
          status: 'masuk', // Custom biasanya dianggap hadir
          snapshotLessonName: payload.subject || 'Custom Lesson',
          snapshotClassName: payload.class || 'Custom Class',
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      } else if (request.type === 'perizinan') {
        // Create activity as 'tidak_hadir'
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'pembelajaran',
          status: 'tidak_hadir',
          timestamp: new Date(),
          description: `Izin: ${payload.absenceType}. Catatan: ${payload.reason}`,
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      } else if (request.type === 'lembur') {
        // Create activity as 'lembur'
        await Activity.create({
          userId: request.userId,
          academicYearId: activeYear?.id,
          type: 'lembur',
          timestamp: new Date(),
          description: payload.reason,
          snapshotTeacherName: (await User.findByPk(request.userId))?.name
        });
      }
    }

    await ApprovalRequest.update({
      status,
      adminNote,
      approvedAt: new Date(),
      approvedBy: adminId
    }, { where: { id } });

    res.json({ message: `Pengajuan berhasil di-${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memproses approval' });
  }
};

module.exports = {
  getApprovalRequests,
  approveRequest
};
