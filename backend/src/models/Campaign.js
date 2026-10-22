const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  publishers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targetAudience: {
    ageRange: { min: Number, max: Number },
    locations: [String],
    interests: [String],
  },
  objective: {
    type: String,
    enum: ['brand_awareness', 'lead_generation', 'conversions', 'traffic', 'engagement'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
  },
  blockchainTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
