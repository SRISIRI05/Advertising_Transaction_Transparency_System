const express = require('express');
const router = express.Router();
const { createReport, getReports, getReport, updateReportStatus, getPublisherComparison } = require('../controllers/deliveryReportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getReports)
  .post(authorize('publisher', 'admin'), createReport);

router.get('/compare/:campaignId', authorize('advertiser', 'admin'), getPublisherComparison);

router.get('/:id', getReport);
router.patch('/:id/status', authorize('advertiser', 'admin'), updateReportStatus);

module.exports = router;
