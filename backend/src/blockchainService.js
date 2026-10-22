const { ethers } = require('ethers');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const BlockchainTransaction = require('./models/BlockchainTransaction');

let contract = null;

// Initialize connection to Ganache and contract
const initBlockchain = () => {
  try {
    const deploymentPath = path.join(__dirname, './blockchain/deployment.json');
    if (!fs.existsSync(deploymentPath)) {
      console.warn('Blockchain: deployment.json not found. Run npm run deploy in /blockchain first.');
      return;
    }

    const { address, abi } = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const privateKey = process.env.GANACHE_PRIVATE_KEY;

    if (!privateKey) {
      console.warn('Blockchain: GANACHE_PRIVATE_KEY not set. Blockchain features disabled.');
      return;
    }

    const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL || 'http://127.0.0.1:7545');
    const wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(address, abi, wallet);

    console.log('Blockchain: Connected to Ganache');
    console.log('Blockchain: ATTSLedger at', address);
  } catch (err) {
    console.warn('Blockchain: Initialization failed -', err.message);
  }
};

// Generate SHA-256 hash of a record object
const hashRecord = (data) => {
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

// Record a transaction on-chain and save to MongoDB
const recordTransaction = async ({ recordType, recordId, data, userId }) => {
  const dataHash = hashRecord(data);

  const txRecord = await BlockchainTransaction.create({
    recordType,
    recordId,
    dataHash,
    recordedBy: userId,
    status: 'pending',
  });

  if (!contract) {
    console.warn(`Blockchain: Skipping on-chain record for ${recordType} ${recordId} (not connected)`);
    return txRecord;
  }

  try {
    const RECORD_TYPE_MAP = { CAMPAIGN: 0, PURCHASE: 1, REPORT: 2, PAYMENT: 3 };
    const tx = await contract.recordTransaction(RECORD_TYPE_MAP[recordType], recordId, dataHash);
    const receipt = await tx.wait();

    txRecord.txHash = receipt.hash;
    txRecord.blockNumber = receipt.blockNumber;
    txRecord.contractAddress = await contract.getAddress();
    txRecord.status = 'confirmed';
    await txRecord.save();

    console.log(`Blockchain: ${recordType} ${recordId} recorded. TxHash: ${receipt.hash}`);
  } catch (err) {
    txRecord.status = 'failed';
    txRecord.errorMessage = err.message;
    await txRecord.save();
    console.error(`Blockchain: Failed to record ${recordType} -`, err.message);
  }

  return txRecord;
};

// Verify a record hash against what is stored on-chain or MongoDB
const verifyRecord = async (recordId, data) => {
  const dataHash = hashRecord(data);

  if (!contract) {
    const txRecord = await BlockchainTransaction.findOne({ recordId });
    if (!txRecord) return { isValid: false, source: 'mongodb', message: 'Record not found' };
    return {
      isValid: txRecord.dataHash === dataHash,
      source: 'mongodb',
      storedHash: txRecord.dataHash,
      computedHash: dataHash,
    };
  }

  try {
    const [isValid, txId, timestamp] = await contract.verifyRecord(recordId, dataHash);
    return {
      isValid,
      source: 'blockchain',
      txId: txId.toString(),
      timestamp: new Date(Number(timestamp) * 1000),
      computedHash: dataHash,
    };
  } catch (err) {
    return { isValid: false, source: 'blockchain', message: err.message };
  }
};

module.exports = { initBlockchain, recordTransaction, verifyRecord, hashRecord };
