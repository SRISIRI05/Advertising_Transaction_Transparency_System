const Publisher = require('../models/Publisher');

// Create publisher profile (publisher user only, once)
const createPublisher = async (req, res) => {
  if (req.user.role !== 'publisher')
    return res.status(403).json({ message: 'Only publisher users can create a publisher profile' });

  if (await Publisher.findOne({ user: req.user._id }))
    return res.status(400).json({ message: 'Publisher profile already exists' });

  const { companyName, contactPhone, website, audienceCategory } = req.body;
  if (!companyName) return res.status(400).json({ message: 'companyName is required' });

  const publisher = await Publisher.create({
    user: req.user._id,
    companyName, contactPhone, website, audienceCategory,
  });

  res.status(201).json(publisher);
};

// Get all publishers (admin/advertiser) or own profile (publisher)
const getPublishers = async (req, res) => {
  const filter = req.user.role === 'publisher' ? { user: req.user._id } : {};
  const publishers = await Publisher.find(filter).populate('user', 'name email');
  res.json(publishers);
};

// Get single publisher
const getPublisher = async (req, res) => {
  const publisher = await Publisher.findById(req.params.id).populate('user', 'name email');
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });
  res.json(publisher);
};

// Update publisher profile (owner or admin)
const updatePublisher = async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

  const isOwner = publisher.user.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const allowed = ['companyName', 'contactPhone', 'website', 'audienceCategory'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) publisher[f] = req.body[f]; });

  await publisher.save();
  res.json(publisher);
};

// Add placement to publisher (owner or admin)
const addPlacement = async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

  const isOwner = publisher.user.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const { name, type, platform, pricePerUnit, unitType, availableInventory } = req.body;
  if (!name || !type || !platform || !pricePerUnit || !unitType)
    return res.status(400).json({ message: 'name, type, platform, pricePerUnit, unitType are required' });

  publisher.placements.push({ name, type, platform, pricePerUnit, unitType, availableInventory });
  await publisher.save();
  res.status(201).json(publisher);
};

// Remove placement (owner or admin)
const removePlacement = async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

  const isOwner = publisher.user.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  publisher.placements = publisher.placements.filter(
    (p) => p._id.toString() !== req.params.placementId
  );
  await publisher.save();
  res.json(publisher);
};

// Verify publisher (admin only)
const verifyPublisher = async (req, res) => {
  const publisher = await Publisher.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true }
  );
  if (!publisher) return res.status(404).json({ message: 'Publisher not found' });
  res.json(publisher);
};

module.exports = { createPublisher, getPublishers, getPublisher, updatePublisher, addPlacement, removePlacement, verifyPublisher };
