const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
