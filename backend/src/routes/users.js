const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllUsers);
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;
