const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['banner', 'video', 'native', 'popup', 'sponsored'], required: true },
  platform: { type: String, required: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
  unitType: { type: String, enum: ['CPM', 'CPC', 'CPD', 'flat'], required: true },
  availableInventory: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const publisherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true, trim: true },
  contactPhone: { type: String },
  website: { type: String },
  audienceCategory: [String],
  placements: [placementSchema],
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Publisher', publisherSchema);
