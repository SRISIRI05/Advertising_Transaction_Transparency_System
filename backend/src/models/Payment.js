const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  mediaPurchase: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaPurchase', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  publisherAmount: { type: Number, required: true },
  agencyCommission: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  publisherStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  agencyStatus: {
    type: String,
    enum: ['pending', 'paid', 'not_applicable'],
    default: 'not_applicable',
  },
  publisherPaidAt: { type: Date },
  agencyPaidAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
