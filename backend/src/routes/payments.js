const express = require('express');
const router = express.Router();
const { getPayments, getPayment, updatePaymentStatus } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getPayments);
router.get('/:id', getPayment);
router.patch('/:id/status', authorize('admin'), updatePaymentStatus);

module.exports = router;
