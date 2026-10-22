const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const Publisher = require('../models/Publisher');

// Get payments — admin sees all, advertiser sees own campaigns, publisher sees own
const getPayments = async (req, res) => {
  let filter = {};

  if (req.user.role === 'advertiser') {
    const campaigns = await Campaign.find({ advertiser: req.user._id }).select('_id');
    filter.campaign = { $in: campaigns.map((c) => c._id) };
  } else if (req.user.role === 'publisher') {
    const publisher = await Publisher.findOne({ user: req.user._id });
    if (!publisher) return res.json([]);
    filter.publisher = publisher._id;
  } else if (req.user.role === 'agency') {
    const Agency = require('../models/Agency');
    const agency = await Agency.findOne({ user: req.user._id });
    if (!agency) return res.json([]);
    filter.agency = agency._id;
  }

  const payments = await Payment.find(filter)
    .populate('mediaPurchase', 'placement totalCost quantity')
    .populate('campaign', 'title')
    .populate('publisher', 'companyName')
    .populate('agency', 'companyName')
    .populate('processedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(payments);
};

// Get single payment
const getPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('mediaPurchase', 'placement totalCost quantity')
    .populate('campaign', 'title budget')
    .populate('publisher', 'companyName')
    .populate('agency', 'companyName commissionRate')
    .populate('processedBy', 'name email');

  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
};

// Update payment status — admin only
const updatePaymentStatus = async (req, res) => {
  const { publisherStatus, agencyStatus } = req.body;

  if (!publisherStatus && !agencyStatus)
    return res.status(400).json({ message: 'publisherStatus or agencyStatus is required' });

  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (publisherStatus) {
    if (!['pending', 'paid'].includes(publisherStatus))
      return res.status(400).json({ message: 'publisherStatus must be pending or paid' });
    payment.publisherStatus = publisherStatus;
    if (publisherStatus === 'paid') payment.publisherPaidAt = new Date();
  }

  if (agencyStatus) {
    if (!['pending', 'paid', 'not_applicable'].includes(agencyStatus))
      return res.status(400).json({ message: 'agencyStatus must be pending, paid, or not_applicable' });
    payment.agencyStatus = agencyStatus;
    if (agencyStatus === 'paid') payment.agencyPaidAt = new Date();
  }

  payment.processedBy = req.user._id;
  await payment.save();
  res.json(payment);
};

module.exports = { getPayments, getPayment, updatePaymentStatus };
