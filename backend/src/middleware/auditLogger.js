const AuditLog = require('../models/AuditLog');

const auditLog = async (req, action, entity, entityId, details = {}) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId.toString(),
      performedBy: req.user._id,
      role: req.user.role,
      details,
      ipAddress: req.ip,
    });
  } catch {
    // never block the main flow
  }
};

module.exports = auditLog;
