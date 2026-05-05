const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ApprovalRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: { 
      type: DataTypes.ENUM('custom_pembelajaran', 'koreksi', 'perizinan', 'lembur'),
      allowNull: false
    },
    status: { 
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    data: { 
      type: DataTypes.JSON,
      allowNull: false 
    },
    adminNote: { type: DataTypes.STRING },
    approvedAt: { type: DataTypes.DATE },
    approvedBy: { type: DataTypes.UUID },
  });
};
