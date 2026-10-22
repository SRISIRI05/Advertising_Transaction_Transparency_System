const MediaPurchase = require('../models/MediaPurchase');
const Campaign = require('../models/Campaign');
const Publisher = require('../models/Publisher');
const Agency = require('../models/Agency');
const { recordTransaction } = require('../blockchainService');

// Create media purchase
const createPurchase = async (req, res) => {
  const { campaignId, publisherId, placementId, quantity, notes } = req.body;

  if (!campaignId || !publisherId || !placementId || !quantity)
    return res.status(400).json({ message: 'campaignId, publisherId, placementId, quantity are required' });

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  if (campaign.status !== 'active')
    return res.status(400).json({ message: 'Purchases can only be made on active campaigns' });

  const isOwner = campaign.advertiser.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const publisher = await Publisher.findById(publisherId);
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

  const placement = publisher.placements.id(placementId);
  if (!placement) return res.status(404).json({ message: 'Placement not found' });
  if (!placement.isActive) return res.status(400).json({ message: 'Placement is not active' });

  if (placement.availableInventory < quantity)
    return res.status(400).json({ message: `Only ${placement.availableInventory} units available` });

  // Calculate agency fee if campaign has an agency assigned
  let agencyFee = 0;
  if (campaign.agencies.length > 0) {
    const agency = await Agency.findOne({ user: { $in: campaign.agencies } });
    if (agency) agencyFee = (placement.pricePerUnit * quantity * agency.commissionRate) / 100;
  }

  const totalCost = placement.pricePerUnit * quantity + agencyFee;
  const remaining = campaign.budget - campaign.spent;

  if (totalCost > remaining)
    return res.status(400).json({
      message: `Purchase exceeds remaining budget. Remaining: ${remaining}, Required: ${totalCost}`,
    });

  const purchase = await MediaPurchase.create({
    campaign: campaignId,
    publisher: publisherId,
    placement: {
      placementId: placement._id,
      name: placement.name,
      type: placement.type,
      platform: placement.platform,
      unitType: placement.unitType,
    },
    purchasedBy: req.user._id,
    quantity,
    pricePerUnit: placement.pricePerUnit,
    agencyFee,
    totalCost,
    notes,
  });

  // Deduct inventory
  placement.availableInventory -= quantity;
  await publisher.save();

  // Update campaign spent
  campaign.spent += totalCost;
  await campaign.save();

  res.status(201).json(purchase);
};

// Get purchases (admin sees all, advertiser sees own campaigns, publisher sees own)
const getPurchases = async (req, res) => {
  let filter = {};

  if (req.user.role === 'advertiser') {
    const campaigns = await Campaign.find({ advertiser: req.user._id }).select('_id');
    filter.campaign = { $in: campaigns.map((c) => c._id) };
  } else if (req.user.role === 'publisher') {
    const publisher = await Publisher.findOne({ user: req.user._id });
    if (!publisher) return res.json([]);
    filter.publisher = publisher._id;
  }

  const purchases = await MediaPurchase.find(filter)
    .populate('campaign', 'title budget spent')
    .populate('publisher', 'companyName')
    .populate('purchasedBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(purchases);
};

// Get single purchase
const getPurchase = async (req, res) => {
  const purchase = await MediaPurchase.findById(req.params.id)
    .populate('campaign', 'title budget spent advertiser')
    .populate('publisher', 'companyName')
    .populate('purchasedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
  res.json(purchase);
};

// Approve or reject purchase (admin only)
const updatePurchaseStatus = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ message: 'Status must be approved or rejected' });

  const purchase = await MediaPurchase.findById(req.params.id);
  if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
  if (purchase.status !== 'pending')
    return res.status(400).json({ message: 'Only pending purchases can be approved or rejected' });

  // If rejecting, restore campaign spent and publisher inventory
  if (status === 'rejected') {
    await Campaign.findByIdAndUpdate(purchase.campaign, { $inc: { spent: -purchase.totalCost } });
    const publisher = await Publisher.findById(purchase.publisher);
    if (publisher) {
      const placement = publisher.placements.id(purchase.placement.placementId);
      if (placement) placement.availableInventory += purchase.quantity;
      await publisher.save();
    }
  }

  purchase.status = status;
  purchase.approvedBy = req.user._id;
  await purchase.save();

  // Record approved purchase on blockchain
  if (status === 'approved') {
    recordTransaction({
      recordType: 'PURCHASE',
      recordId: purchase._id.toString(),
      data: {
        campaign: purchase.campaign.toString(),
        publisher: purchase.publisher.toString(),
        totalCost: purchase.totalCost,
        quantity: purchase.quantity,
        status: 'approved',
      },
      userId: req.user._id,
    }).then((tx) => {
      if (tx?.txHash) MediaPurchase.findByIdAndUpdate(purchase._id, { blockchainTxHash: tx.txHash }).exec();
    }).catch(() => {});
  }

  res.json(purchase);
};

// Cancel purchase (owner or admin, only if pending)
const cancelPurchase = async (req, res) => {
  const purchase = await MediaPurchase.findById(req.params.id)
    .populate('campaign', 'advertiser');

  if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

  const isOwner = purchase.purchasedBy.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  if (purchase.status !== 'pending')
    return res.status(400).json({ message: 'Only pending purchases can be cancelled' });

  // Restore campaign spent and publisher inventory
  await Campaign.findByIdAndUpdate(purchase.campaign, { $inc: { spent: -purchase.totalCost } });
  const publisher = await Publisher.findById(purchase.publisher);
  if (publisher) {
    const placement = publisher.placements.id(purchase.placement.placementId);
    if (placement) placement.availableInventory += purchase.quantity;
    await publisher.save();
  }

  purchase.status = 'cancelled';
  await purchase.save();
  res.json(purchase);
};

module.exports = { createPurchase, getPurchases, getPurchase, updatePurchaseStatus, cancelPurchase };
