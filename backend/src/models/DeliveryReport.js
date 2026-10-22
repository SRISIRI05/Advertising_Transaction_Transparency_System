const mongoose = require('mongoose');

const deliveryReportSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  mediaPurchase: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaPurchase', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportingPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  impressions: { type: Number, default: 0, min: 0 },
  clicks: { type: Number, default: 0, min: 0 },
  spend: { type: Number, default: 0, min: 0 },
  ctr: { type: Number, default: 0 },   // clicks / impressions * 100
  cpm: { type: Number, default: 0 },   // spend / impressions * 1000
  status: {
    type: String,
    enum: ['pending', 'approved', 'disputed'],
    default: 'pending',
  },
  reportHash: { type: String },         // SHA-256 hash (Feature 8)
  blockchainTxHash: { type: String },   // on-chain record (Feature 6)
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DeliveryReport', deliveryReportSchema);
