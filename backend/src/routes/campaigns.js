const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, getCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCampaigns)
  .post(authorize('advertiser', 'admin'), createCampaign);

router.route('/:id')
  .get(getCampaign)
  .put(authorize('advertiser', 'admin'), updateCampaign)
  .delete(authorize('advertiser', 'admin'), deleteCampaign);

module.exports = router;
