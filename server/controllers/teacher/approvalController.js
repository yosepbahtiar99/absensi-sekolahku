const { ApprovalRequest, Activity, Schedule, Class, Lesson } = require('../../models');

const createApprovalRequest = async (req, res) => {
  try {
    const { type, activityId, data } = req.body;
    const userId = req.user.id;

    const request = await ApprovalRequest.create({
      type,
      userId,
      activityId,
      data,
      status: 'pending'
    });

    res.json({ message: 'Pengajuan berhasil dikirim', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengirim pengajuan' });
  }
};

const getMyApprovalRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await ApprovalRequest.findAndCountAll({
      where: { userId },
      include: [
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

module.exports = {
  createApprovalRequest,
  getMyApprovalRequests
};
