const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  contactPhone: { type: String },
  address: { type: String },
  commissionRate: { type: Number, default: 10, min: 0, max: 100 }, // percentage
  isVerified: { type: Boolean, default: false },
  campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);
