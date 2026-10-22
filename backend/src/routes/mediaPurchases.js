const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases, getPurchase, updatePurchaseStatus, cancelPurchase } = require('../controllers/mediaPurchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(authorize('advertiser', 'admin'), createPurchase);

router.get('/:id', getPurchase);
router.patch('/:id/status', authorize('admin'), updatePurchaseStatus);
router.patch('/:id/cancel', authorize('advertiser', 'admin'), cancelPurchase);

module.exports = router;
