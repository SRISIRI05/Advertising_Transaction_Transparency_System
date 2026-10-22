const express = require('express');
const router = express.Router();
const { createPublisher, getPublishers, getPublisher, updatePublisher, addPlacement, removePlacement, verifyPublisher } = require('../controllers/publisherController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'advertiser', 'agency', 'publisher'), getPublishers)
  .post(authorize('publisher'), createPublisher);

router.route('/:id')
  .get(authorize('admin', 'advertiser', 'agency', 'publisher'), getPublisher)
  .put(authorize('admin', 'publisher'), updatePublisher);

router.post('/:id/placements', authorize('admin', 'publisher'), addPlacement);
router.delete('/:id/placements/:placementId', authorize('admin', 'publisher'), removePlacement);
router.patch('/:id/verify', authorize('admin'), verifyPublisher);

module.exports = router;
