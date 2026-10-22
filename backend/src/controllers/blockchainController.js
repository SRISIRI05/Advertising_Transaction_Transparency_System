const BlockchainTransaction = require('../models/BlockchainTransaction');
const { verifyRecord, hashRecord } = require('../blockchainService');

// Get all blockchain transactions (admin) or own (others)
const getTransactions = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { recordedBy: req.user._id };
  if (req.query.recordType) filter.recordType = req.query.recordType;

  const transactions = await BlockchainTransaction.find(filter)
    .populate('recordedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(transactions);
};

// Get single blockchain transaction
const getTransaction = async (req, res) => {
  const tx = await BlockchainTransaction.findById(req.params.id)
    .populate('recordedBy', 'name email');
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  res.json(tx);
};

// Get transaction by recordId
const getTransactionByRecordId = async (req, res) => {
  const tx = await BlockchainTransaction.findOne({ recordId: req.params.recordId })
    .populate('recordedBy', 'name email');
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  res.json(tx);
};

// Verify a record hash
const verify = async (req, res) => {
  const { recordId, data } = req.body;
  if (!recordId || !data)
    return res.status(400).json({ message: 'recordId and data are required' });

  const result = await verifyRecord(recordId, data);
  res.json(result);
};

module.exports = { getTransactions, getTransaction, getTransactionByRecordId, verify };
