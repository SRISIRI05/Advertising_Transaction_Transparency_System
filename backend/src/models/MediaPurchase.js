const mongoose = require('mongoose');

const mediaPurchaseSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  placement: {
    placementId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: String,
    type: String,
    platform: String,
    unitType: String,
  },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true, min: 0 },
  agencyFee: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  notes: { type: String },
  blockchainTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MediaPurchase', mediaPurchaseSchema);
