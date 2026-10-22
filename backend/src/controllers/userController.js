const User = require('../models/User');

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

const updateUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

module.exports = { getAllUsers, updateUserStatus };
