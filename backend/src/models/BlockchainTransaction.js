const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema({
  recordType: {
    type: String,
    enum: ['CAMPAIGN', 'PURCHASE', 'REPORT', 'PAYMENT'],
    required: true,
  },
  recordId: { type: String, required: true, unique: true }, // MongoDB ObjectId as string
  dataHash: { type: String, required: true },               // SHA-256 hash of the record
  txHash: { type: String },                                 // blockchain tx hash
  blockNumber: { type: Number },
  contractAddress: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  errorMessage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
