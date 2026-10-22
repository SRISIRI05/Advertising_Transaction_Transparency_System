const express = require('express');
const router = express.Router();
const { getCampaignSummary, getSpendBreakdown, getTransparencyReport, getAuditLogs } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/campaigns/:campaignId/summary', authorize('advertiser', 'admin'), getCampaignSummary);
router.get('/campaigns/:campaignId/spend', authorize('advertiser', 'admin'), getSpendBreakdown);
router.get('/campaigns/:campaignId/transparency', authorize('advertiser', 'admin'), getTransparencyReport);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

module.exports = router;
