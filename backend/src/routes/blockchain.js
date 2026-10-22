const express = require('express');
const router = express.Router();
const { getTransactions, getTransaction, getTransactionByRecordId, verify } = require('../controllers/blockchainController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'advertiser'), getTransactions);
router.post('/verify', verify);
router.get('/record/:recordId', getTransactionByRecordId);
router.get('/:id', getTransaction);

module.exports = router;
