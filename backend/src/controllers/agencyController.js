const Agency = require('../models/Agency');
const User = require('../models/User');

// Create agency profile (agency user only, once)
const createAgency = async (req, res) => {
  if (req.user.role !== 'agency')
    return res.status(403).json({ message: 'Only agency users can create an agency profile' });

  if (await Agency.findOne({ user: req.user._id }))
    return res.status(400).json({ message: 'Agency profile already exists' });

  const { companyName, contactPhone, address, commissionRate } = req.body;
  if (!companyName) return res.status(400).json({ message: 'companyName is required' });

  const agency = await Agency.create({
    user: req.user._id,
    companyName, contactPhone, address, commissionRate,
  });

  res.status(201).json(agency);
};

// Get all agencies (admin) or own profile (agency)
const getAgencies = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const agencies = await Agency.find(filter).populate('user', 'name email');
  res.json(agencies);
};

// Get single agency
const getAgency = async (req, res) => {
  const agency = await Agency.findById(req.params.id).populate('user', 'name email');
  if (!agency) return res.status(404).json({ message: 'Agency not found' });
  res.json(agency);
};

// Update agency profile (owner or admin)
const updateAgency = async (req, res) => {
  const agency = await Agency.findById(req.params.id);
  if (!agency) return res.status(404).json({ message: 'Agency not found' });

  const isOwner = agency.user.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner)
    return res.status(403).json({ message: 'Access denied' });

  const allowed = ['companyName', 'contactPhone', 'address', 'commissionRate'];
  allowed.forEach((f) => { if (req.body[f] !== undefined) agency[f] = req.body[f]; });

  await agency.save();
  res.json(agency);
};

// Verify agency (admin only)
const verifyAgency = async (req, res) => {
  const agency = await Agency.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true }
  );
  if (!agency) return res.status(404).json({ message: 'Agency not found' });
  res.json(agency);
};

module.exports = { createAgency, getAgencies, getAgency, updateAgency, verifyAgency };
