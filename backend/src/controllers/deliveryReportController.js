const DeliveryReport = require('../models/DeliveryReport');
const MediaPurchase = require('../models/MediaPurchase');
const Campaign = require('../models/Campaign');
const Publisher = require('../models/Publisher');

// Submit delivery report
const createReport = async (req, res) => {
  const { mediaPurchaseId, reportingPeriod, impressions, clicks, spend, notes } = req.body;

  if (!mediaPurchaseId || !reportingPeriod?.startDate || !reportingPeriod?.endDate)
    return res.status(400).json({ message: 'mediaPurchaseId, reportingPeriod.startDate, reportingPeriod.endDate are required' });

  const purchase = await MediaPurchase.findById(mediaPurchaseId).populate('campaign');
  if (!purchase) return res.status(404).json({ message: 'Media purchase not found' });
  if (purchase.status !== 'approved')
    return res.status(400).json({ message: 'Reports can only be submitted for approved purchases' });

  // Only publisher who owns the purchase or admin can submit
  const publisherProfile = await Publisher.findOne({ user: req.user._id });
  const isPublisher = publisherProfile && purchase.publisher.toString() === publisherProfile._id.toString();
  if (req.user.role !== 'admin' && !isPublisher)
    return res.status(403).json({ message: 'Access denied' });

  const imp = impressions || 0;
  const clk = clicks || 0;
  const spd = spend || 0;
  const ctr = imp > 0 ? parseFloat(((clk / imp) * 100).toFixed(4)) : 0;
  const cpm = imp > 0 ? parseFloat(((spd / imp) * 1000).toFixed(4)) : 0;

  const report = await DeliveryReport.create({
    campaign: purchase.campaign._id,
    publisher: purchase.publisher,
    mediaPurchase: mediaPurchaseId,
    submittedBy: req.user._id,
    reportingPeriod,
    impressions: imp,
    clicks: clk,
    spend: spd,
    ctr,
    cpm,
    notes,
  });

  res.status(201).json(report);
};

// Get reports
const getReports = async (req, res) => {
  let filter = {};

  if (req.user.role === 'advertiser') {
    const campaigns = await Campaign.find({ advertiser: req.user._id }).select('_id');
    filter.campaign = { $in: campaigns.map((c) => c._id) };
  } else if (req.user.role === 'publisher') {
    const publisher = await Publisher.findOne({ user: req.user._id });
    if (!publisher) return res.json([]);
    filter.publisher = publisher._id;
  }

  // Optional filter by campaignId query param
  if (req.query.campaignId) filter.campaign = req.query.campaignId;

  const reports = await DeliveryReport.find(filter)
    .populate('campaign', 'title')
    .populate('publisher', 'companyName')
    .populate('mediaPurchase', 'placement totalCost')
    .populate('submittedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(reports);
};

// Get single report
const getReport = async (req, res) => {
  const report = await DeliveryReport.findById(req.params.id)
    .populate('campaign', 'title budget')
    .populate('publisher', 'companyName')
    .populate('mediaPurchase', 'placement totalCost quantity')
    .populate('submittedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
};

// Approve or dispute report (admin or advertiser)
const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'disputed'].includes(status))
    return res.status(400).json({ message: 'Status must be approved or disputed' });

  const report = await DeliveryReport.findById(req.params.id).populate('campaign');
  if (!report) return res.status(404).json({ message: 'Report not found' });
  if (report.status !== 'pending')
    return res.status(400).json({ message: 'Only pending reports can be approved or disputed' });

  // Advertiser who owns the campaign or admin can approve/dispute
  const isOwner = report.campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  report.status = status;
  report.approvedBy = req.user._id;
  await report.save();

  res.json(report);
};

// Get publisher performance comparison for a campaign
const getPublisherComparison = async (req, res) => {
  const { campaignId } = req.params;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const reports = await DeliveryReport.find({ campaign: campaignId, status: 'approved' })
    .populate('publisher', 'companyName');

  // Aggregate by publisher
  const map = {};
  reports.forEach((r) => {
    const pid = r.publisher._id.toString();
    if (!map[pid]) {
      map[pid] = { publisher: r.publisher.companyName, impressions: 0, clicks: 0, spend: 0, reports: 0 };
    }
    map[pid].impressions += r.impressions;
    map[pid].clicks += r.clicks;
    map[pid].spend += r.spend;
    map[pid].reports += 1;
  });

  const comparison = Object.values(map).map((p) => ({
    ...p,
    ctr: p.impressions > 0 ? parseFloat(((p.clicks / p.impressions) * 100).toFixed(4)) : 0,
    cpm: p.impressions > 0 ? parseFloat(((p.spend / p.impressions) * 1000).toFixed(4)) : 0,
  }));

  res.json(comparison);
};

module.exports = { createReport, getReports, getReport, updateReportStatus, getPublisherComparison };
