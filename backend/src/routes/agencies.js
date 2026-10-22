const express = require('express');
const router = express.Router();
const { createAgency, getAgencies, getAgency, updateAgency, verifyAgency } = require('../controllers/agencyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'agency', 'advertiser'), getAgencies)
  .post(authorize('agency'), createAgency);

router.route('/:id')
  .get(authorize('admin', 'agency', 'advertiser'), getAgency)
  .put(authorize('admin', 'agency'), updateAgency);

router.patch('/:id/verify', authorize('admin'), verifyAgency);

module.exports = router;
