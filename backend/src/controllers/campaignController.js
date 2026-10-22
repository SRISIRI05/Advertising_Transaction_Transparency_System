const Campaign = require('../models/Campaign');
const { recordTransaction } = require('../blockchainService');

// Create campaign
const createCampaign = async (req, res) => {
  const { title, description, budget, startDate, endDate, targetAudience, objective, agencies, publishers } = req.body;

  if (!title || !budget || !startDate || !endDate || !objective)
    return res.status(400).json({ message: 'title, budget, startDate, endDate, objective are required' });

  if (new Date(startDate) >= new Date(endDate))
    return res.status(400).json({ message: 'endDate must be after startDate' });

  const campaign = await Campaign.create({
    title, description, budget, startDate, endDate,
    targetAudience, objective,
    agencies: agencies || [],
    publishers: publishers || [],
    advertiser: req.user._id,
  });

  // Record on blockchain
  recordTransaction({
    recordType: 'CAMPAIGN',
    recordId: campaign._id.toString(),
    data: { title, budget, objective, startDate, endDate, advertiser: req.user._id.toString() },
    userId: req.user._id,
  }).then((tx) => {
    if (tx?.txHash) Campaign.findByIdAndUpdate(campaign._id, { blockchainTxHash: tx.txHash }).exec();
  }).catch(() => {});

  res.status(201).json(campaign);
};

// Get all campaigns (admin sees all, advertiser sees own)
const getCampaigns = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { advertiser: req.user._id };
  const campaigns = await Campaign.find(filter)
    .populate('advertiser', 'name email')
    .populate('agencies', 'name email')
    .populate('publishers', 'name email')
    .sort({ createdAt: -1 });
  res.json(campaigns);
};

// Get single campaign
const getCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate('advertiser', 'name email')
    .populate('agencies', 'name email')
    .populate('publishers', 'name email');

  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  res.json(campaign);
};

// Update campaign
const updateCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  if (campaign.status === 'completed' || campaign.status === 'cancelled')
    return res.status(400).json({ message: `Cannot update a ${campaign.status} campaign` });

  const allowed = ['title', 'description', 'budget', 'startDate', 'endDate', 'targetAudience', 'objective', 'status', 'agencies', 'publishers'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) campaign[field] = req.body[field];
  });

  if (req.body.budget !== undefined && req.body.budget < campaign.spent)
    return res.status(400).json({ message: 'Budget cannot be less than amount already spent' });

  await campaign.save();
  res.json(campaign);
};

// Delete campaign (admin or owner, only if draft)
const deleteCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const isOwner = campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  if (campaign.status !== 'draft')
    return res.status(400).json({ message: 'Only draft campaigns can be deleted' });

  await campaign.deleteOne();
  res.json({ message: 'Campaign deleted' });
};

module.exports = { createCampaign, getCampaigns, getCampaign, updateCampaign, deleteCampaign };
