const Campaign = require('../models/Campaign');
const MediaPurchase = require('../models/MediaPurchase');
const DeliveryReport = require('../models/DeliveryReport');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const BlockchainTransaction = require('../models/BlockchainTransaction');

// Campaign performance summary
const getCampaignSummary = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId)
    .populate('advertiser', 'name email');
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const [purchases, reports, payments] = await Promise.all([
    MediaPurchase.find({ campaign: campaign._id }),
    DeliveryReport.find({ campaign: campaign._id, status: 'approved' }),
    Payment.find({ campaign: campaign._id }),
  ]);

  const totalImpressions = reports.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = reports.reduce((s, r) => s + r.clicks, 0);
  const totalSpend = reports.reduce((s, r) => s + r.spend, 0);
  const ctr = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(4)) : 0;
  const cpm = totalImpressions > 0 ? parseFloat(((totalSpend / totalImpressions) * 1000).toFixed(4)) : 0;

  const pendingPayments = payments.filter((p) => p.publisherStatus === 'pending').length;
  const paidPayments = payments.filter((p) => p.publisherStatus === 'paid').length;

  res.json({
    campaign: { id: campaign._id, title: campaign.title, status: campaign.status, budget: campaign.budget, spent: campaign.spent },
    budgetUtilization: campaign.budget > 0 ? parseFloat(((campaign.spent / campaign.budget) * 100).toFixed(2)) : 0,
    purchases: { total: purchases.length, approved: purchases.filter((p) => p.status === 'approved').length, pending: purchases.filter((p) => p.status === 'pending').length },
    reports: { total: reports.length, totalImpressions, totalClicks, totalSpend, ctr, cpm },
    payments: { total: payments.length, pending: pendingPayments, paid: paidPayments },
  });
};

// Spend breakdown by publisher for a campaign
const getSpendBreakdown = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const purchases = await MediaPurchase.find({ campaign: campaign._id, status: 'approved' })
    .populate('publisher', 'companyName');

  const map = {};
  purchases.forEach((p) => {
    const pid = p.publisher._id.toString();
    if (!map[pid]) map[pid] = { publisher: p.publisher.companyName, totalCost: 0, agencyFee: 0, purchases: 0 };
    map[pid].totalCost += p.totalCost;
    map[pid].agencyFee += p.agencyFee;
    map[pid].purchases += 1;
  });

  res.json(Object.values(map));
};

// Full transparency report for a campaign
const getTransparencyReport = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId)
    .populate('advertiser', 'name email')
    .populate('agencies', 'name email')
    .populate('publishers', 'name email');
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const [purchases, reports, payments, blockchainTxs, auditLogs] = await Promise.all([
    MediaPurchase.find({ campaign: campaign._id }).populate('publisher', 'companyName').populate('purchasedBy', 'name'),
    DeliveryReport.find({ campaign: campaign._id }).populate('publisher', 'companyName').populate('submittedBy', 'name'),
    Payment.find({ campaign: campaign._id }).populate('publisher', 'companyName'),
    BlockchainTransaction.find({ recordId: { $in: [campaign._id.toString(), ...purchases.map ? [] : []] } }),
    AuditLog.find({ entityId: campaign._id.toString() }).populate('performedBy', 'name role').sort({ createdAt: 1 }),
  ]);

  res.json({ campaign, purchases, reports, payments, blockchainTxs, auditLogs });
};

// Get all audit logs (admin only)
const getAuditLogs = async (req, res) => {
  const filter = {};
  if (req.query.entity) filter.entity = req.query.entity;
  if (req.query.entityId) filter.entityId = req.query.entityId;
  if (req.query.action) filter.action = req.query.action;

  const logs = await AuditLog.find(filter)
    .populate('performedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
};

module.exports = { getCampaignSummary, getSpendBreakdown, getTransparencyReport, getAuditLogs };
