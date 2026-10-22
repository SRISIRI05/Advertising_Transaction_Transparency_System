require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('./src/models/User');
const Agency = require('./src/models/Agency');
const Publisher = require('./src/models/Publisher');
const Campaign = require('./src/models/Campaign');
const MediaPurchase = require('./src/models/MediaPurchase');
const DeliveryReport = require('./src/models/DeliveryReport');
const Payment = require('./src/models/Payment');
const BlockchainTransaction = require('./src/models/BlockchainTransaction');
const AuditLog = require('./src/models/AuditLog');

const hash = (data) => crypto.createHash('sha256').update(JSON.stringify(data, Object.keys(data).sort())).digest('hex');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Agency.deleteMany({}), Publisher.deleteMany({}),
    Campaign.deleteMany({}), MediaPurchase.deleteMany({}), DeliveryReport.deleteMany({}),
    Payment.deleteMany({}), BlockchainTransaction.deleteMany({}), AuditLog.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  const pw = await bcrypt.hash('Password@123', 10);

  // ── Users ──────────────────────────────────────────────────
  const [admin, adv1, adv2, agency1, agency2, pub1, pub2, pub3] = await User.insertMany([
    { name: 'Arjun Sharma',     email: 'admin@atts.com',         password: pw, role: 'admin' },
    { name: 'Priya Mehta',      email: 'priya@brandsindia.com',  password: pw, role: 'advertiser' },
    { name: 'Rohan Kapoor',     email: 'rohan@kapooradv.com',    password: pw, role: 'advertiser' },
    { name: 'Sneha Iyer',       email: 'sneha@iyermedia.com',    password: pw, role: 'agency' },
    { name: 'Vikram Nair',      email: 'vikram@nairagency.com',  password: pw, role: 'agency' },
    { name: 'Ananya Reddy',     email: 'ananya@reddynews.com',   password: pw, role: 'publisher' },
    { name: 'Karthik Pillai',   email: 'karthik@pillaitech.com', password: pw, role: 'publisher' },
    { name: 'Deepika Joshi',    email: 'deepika@joshimedia.com', password: pw, role: 'publisher' },
  ]);
  console.log('Users created');

  // ── Agencies ───────────────────────────────────────────────
  const [ag1, ag2] = await Agency.insertMany([
    {
      user: agency1._id, companyName: 'Iyer Media Solutions',
      contactPhone: '+91-9876543210', address: 'MG Road, Bengaluru, Karnataka',
      commissionRate: 12, isVerified: true,
    },
    {
      user: agency2._id, companyName: 'Nair Advertising Group',
      contactPhone: '+91-9823456789', address: 'Marine Drive, Mumbai, Maharashtra',
      commissionRate: 10, isVerified: true,
    },
  ]);
  console.log('Agencies created');

  // ── Publishers ─────────────────────────────────────────────
  const [pb1, pb2, pb3] = await Publisher.insertMany([
    {
      user: pub1._id, companyName: 'Reddy News Network',
      contactPhone: '+91-9812345678', website: 'https://reddynews.in',
      audienceCategory: ['news', 'politics', 'business'], isVerified: true,
      placements: [
        { name: 'Homepage Banner', type: 'banner', platform: 'web', pricePerUnit: 250, unitType: 'CPM', availableInventory: 5000, isActive: true },
        { name: 'Article Sidebar', type: 'banner', platform: 'web', pricePerUnit: 150, unitType: 'CPM', availableInventory: 8000, isActive: true },
        { name: 'Pre-roll Video', type: 'video', platform: 'web', pricePerUnit: 500, unitType: 'CPM', availableInventory: 2000, isActive: true },
      ],
    },
    {
      user: pub2._id, companyName: 'Pillai Tech Digest',
      contactPhone: '+91-9834567890', website: 'https://pillaitech.in',
      audienceCategory: ['technology', 'startups', 'finance'], isVerified: true,
      placements: [
        { name: 'Top Leaderboard', type: 'banner', platform: 'web', pricePerUnit: 300, unitType: 'CPM', availableInventory: 4000, isActive: true },
        { name: 'Native Article Sponsor', type: 'native', platform: 'web', pricePerUnit: 8000, unitType: 'flat', availableInventory: 30, isActive: true },
        { name: 'Mobile Interstitial', type: 'popup', platform: 'mobile', pricePerUnit: 180, unitType: 'CPM', availableInventory: 10000, isActive: true },
      ],
    },
    {
      user: pub3._id, companyName: 'Joshi Entertainment Hub',
      contactPhone: '+91-9845678901', website: 'https://joshientertainment.in',
      audienceCategory: ['entertainment', 'lifestyle', 'sports'], isVerified: false,
      placements: [
        { name: 'Video Pre-roll', type: 'video', platform: 'web', pricePerUnit: 450, unitType: 'CPM', availableInventory: 3000, isActive: true },
        { name: 'Sponsored Post', type: 'sponsored', platform: 'web', pricePerUnit: 12000, unitType: 'flat', availableInventory: 20, isActive: true },
      ],
    },
  ]);
  console.log('Publishers created');

  // ── Campaigns ──────────────────────────────────────────────
  const [camp1, camp2, camp3, camp4] = await Campaign.insertMany([
    {
      title: 'Diwali Festive Sale 2024',
      description: 'Boost brand awareness and drive conversions during the Diwali festive season across India.',
      advertiser: adv1._id,
      agencies: [agency1._id],
      publishers: [pub1._id, pub2._id],
      budget: 500000, spent: 187500,
      startDate: new Date('2024-10-15'), endDate: new Date('2024-11-15'),
      targetAudience: { ageRange: { min: 22, max: 45 }, locations: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai'], interests: ['shopping', 'fashion', 'electronics'] },
      objective: 'conversions', status: 'active',
    },
    {
      title: 'BharatPay App Launch',
      description: 'Drive app installs and user registrations for the new BharatPay fintech application.',
      advertiser: adv1._id,
      agencies: [agency1._id],
      publishers: [pub2._id],
      budget: 300000, spent: 96000,
      startDate: new Date('2024-09-01'), endDate: new Date('2024-12-01'),
      targetAudience: { ageRange: { min: 18, max: 40 }, locations: ['Hyderabad', 'Pune', 'Ahmedabad'], interests: ['finance', 'technology', 'startups'] },
      objective: 'lead_generation', status: 'active',
    },
    {
      title: 'Kapoor Motors Brand Awareness',
      description: 'Increase brand recall for Kapoor Motors new electric vehicle lineup across metro cities.',
      advertiser: adv2._id,
      agencies: [agency2._id],
      publishers: [pub1._id, pub3._id],
      budget: 750000, spent: 225000,
      startDate: new Date('2024-08-01'), endDate: new Date('2025-01-31'),
      targetAudience: { ageRange: { min: 28, max: 55 }, locations: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'], interests: ['automobiles', 'technology', 'environment'] },
      objective: 'brand_awareness', status: 'active',
    },
    {
      title: 'Monsoon Traffic Drive',
      description: 'Drive website traffic during the monsoon season for travel and tourism packages.',
      advertiser: adv2._id,
      agencies: [],
      publishers: [pub3._id],
      budget: 150000, spent: 0,
      startDate: new Date('2025-06-01'), endDate: new Date('2025-08-31'),
      targetAudience: { ageRange: { min: 25, max: 50 }, locations: ['Goa', 'Kerala', 'Himachal Pradesh'], interests: ['travel', 'tourism', 'adventure'] },
      objective: 'traffic', status: 'draft',
    },
  ]);
  console.log('Campaigns created');

  // ── Media Purchases ────────────────────────────────────────
  const pb1Placement0 = pb1.placements[0];
  const pb1Placement1 = pb1.placements[1];
  const pb1Placement2 = pb1.placements[2];
  const pb2Placement0 = pb2.placements[0];
  const pb2Placement1 = pb2.placements[1];
  const pb2Placement2 = pb2.placements[2];
  const pb3Placement0 = pb3.placements[0];

  const mkPlacement = (p) => ({ placementId: p._id, name: p.name, type: p.type, platform: p.platform, unitType: p.unitType });

  const col = mongoose.connection.collection('mediapurchases');
  const mpDocs = [
    { campaign: camp1._id, publisher: pb1._id, placement: mkPlacement(pb1Placement0), purchasedBy: adv1._id, approvedBy: admin._id, quantity: 200, pricePerUnit: 250, agencyFee: 6000, totalCost: 56000, status: 'approved', notes: 'Diwali homepage banner — prime slot', createdAt: new Date(), updatedAt: new Date() },
    { campaign: camp1._id, publisher: pb2._id, placement: mkPlacement(pb2Placement0), purchasedBy: adv1._id, approvedBy: admin._id, quantity: 300, pricePerUnit: 300, agencyFee: 10800, totalCost: 100800, status: 'approved', notes: 'Tech audience leaderboard for Diwali', createdAt: new Date(), updatedAt: new Date() },
    { campaign: camp2._id, publisher: pb2._id, placement: mkPlacement(pb2Placement1), purchasedBy: adv1._id, approvedBy: admin._id, quantity: 8, pricePerUnit: 8000, agencyFee: 7680, totalCost: 71680, status: 'approved', notes: 'Native sponsored article for BharatPay launch', createdAt: new Date(), updatedAt: new Date() },
    { campaign: camp3._id, publisher: pb1._id, placement: mkPlacement(pb1Placement2), purchasedBy: adv2._id, approvedBy: admin._id, quantity: 150, pricePerUnit: 500, agencyFee: 7500, totalCost: 82500, status: 'approved', notes: 'Pre-roll video for EV brand awareness', createdAt: new Date(), updatedAt: new Date() },
    { campaign: camp3._id, publisher: pb3._id, placement: mkPlacement(pb3Placement0), purchasedBy: adv2._id, quantity: 100, pricePerUnit: 450, agencyFee: 4500, totalCost: 49500, status: 'pending', notes: 'Entertainment video pre-roll — awaiting approval', createdAt: new Date(), updatedAt: new Date() },
  ];
  const mpResult = await col.insertMany(mpDocs);
  const mpIds = Object.values(mpResult.insertedIds);
  const [mp1id, mp2id, mp3id, mp4id, mp5id] = mpIds;
  const mp1 = { _id: mp1id }; const mp2 = { _id: mp2id }; const mp3 = { _id: mp3id }; const mp4 = { _id: mp4id }; const mp5 = { _id: mp5id };
  console.log('Media Purchases created');

  // ── Delivery Reports ───────────────────────────────────────
  const makeHash = (d) => hash({ mediaPurchaseId: d.mediaPurchaseId, impressions: d.impressions, clicks: d.clicks, spend: d.spend, startDate: d.startDate, endDate: d.endDate });

  const r1Data = { mediaPurchaseId: mp1._id.toString(), impressions: 185000, clicks: 4625, spend: 46250, startDate: '2024-10-15', endDate: '2024-10-31' };
  const r2Data = { mediaPurchaseId: mp2._id.toString(), impressions: 270000, clicks: 8100, spend: 81000, startDate: '2024-10-15', endDate: '2024-10-31' };
  const r3Data = { mediaPurchaseId: mp3._id.toString(), impressions: 95000, clicks: 2850, spend: 28500, startDate: '2024-09-01', endDate: '2024-09-30' };
  const r4Data = { mediaPurchaseId: mp4._id.toString(), impressions: 140000, clicks: 2800, spend: 70000, startDate: '2024-08-01', endDate: '2024-08-31' };

  const [rep1, rep2, rep3, rep4] = await DeliveryReport.insertMany([
    {
      campaign: camp1._id, publisher: pb1._id, mediaPurchase: mp1._id,
      submittedBy: pub1._id, approvedBy: admin._id,
      reportingPeriod: { startDate: new Date('2024-10-15'), endDate: new Date('2024-10-31') },
      impressions: 185000, clicks: 4625, spend: 46250,
      ctr: parseFloat(((4625 / 185000) * 100).toFixed(4)),
      cpm: parseFloat(((46250 / 185000) * 1000).toFixed(4)),
      status: 'approved', reportHash: makeHash(r1Data),
      notes: 'Diwali homepage banner — Week 1 report',
    },
    {
      campaign: camp1._id, publisher: pb2._id, mediaPurchase: mp2._id,
      submittedBy: pub2._id, approvedBy: admin._id,
      reportingPeriod: { startDate: new Date('2024-10-15'), endDate: new Date('2024-10-31') },
      impressions: 270000, clicks: 8100, spend: 81000,
      ctr: parseFloat(((8100 / 270000) * 100).toFixed(4)),
      cpm: parseFloat(((81000 / 270000) * 1000).toFixed(4)),
      status: 'approved', reportHash: makeHash(r2Data),
      notes: 'Tech leaderboard — strong CTR from tech audience',
    },
    {
      campaign: camp2._id, publisher: pb2._id, mediaPurchase: mp3._id,
      submittedBy: pub2._id,
      reportingPeriod: { startDate: new Date('2024-09-01'), endDate: new Date('2024-09-30') },
      impressions: 95000, clicks: 2850, spend: 28500,
      ctr: parseFloat(((2850 / 95000) * 100).toFixed(4)),
      cpm: parseFloat(((28500 / 95000) * 1000).toFixed(4)),
      status: 'pending', reportHash: makeHash(r3Data),
      notes: 'BharatPay native article — September report',
    },
    {
      campaign: camp3._id, publisher: pb1._id, mediaPurchase: mp4._id,
      submittedBy: pub1._id,
      reportingPeriod: { startDate: new Date('2024-08-01'), endDate: new Date('2024-08-31') },
      impressions: 140000, clicks: 2800, spend: 70000,
      ctr: parseFloat(((2800 / 140000) * 100).toFixed(4)),
      cpm: parseFloat(((70000 / 140000) * 1000).toFixed(4)),
      status: 'disputed', reportHash: makeHash(r4Data),
      notes: 'EV pre-roll video — disputed due to viewability concerns',
    },
  ]);
  console.log('Delivery Reports created');

  // ── Payments ───────────────────────────────────────────────
  await Payment.insertMany([
    {
      mediaPurchase: mp1._id, campaign: camp1._id, publisher: pb1._id, agency: ag1._id,
      publisherAmount: 50000, agencyCommission: 6000, totalAmount: 56000,
      publisherStatus: 'paid', agencyStatus: 'paid',
      publisherPaidAt: new Date('2024-11-05'), agencyPaidAt: new Date('2024-11-05'),
      processedBy: admin._id,
    },
    {
      mediaPurchase: mp2._id, campaign: camp1._id, publisher: pb2._id, agency: ag1._id,
      publisherAmount: 90000, agencyCommission: 10800, totalAmount: 100800,
      publisherStatus: 'paid', agencyStatus: 'pending',
      publisherPaidAt: new Date('2024-11-06'),
      processedBy: admin._id,
    },
    {
      mediaPurchase: mp3._id, campaign: camp2._id, publisher: pb2._id, agency: ag1._id,
      publisherAmount: 64000, agencyCommission: 7680, totalAmount: 71680,
      publisherStatus: 'pending', agencyStatus: 'pending',
    },
    {
      mediaPurchase: mp4._id, campaign: camp3._id, publisher: pb1._id, agency: ag2._id,
      publisherAmount: 75000, agencyCommission: 7500, totalAmount: 82500,
      publisherStatus: 'pending', agencyStatus: 'pending',
    },
  ]);
  console.log('Payments created');

  // ── Blockchain Transactions ────────────────────────────────
  await BlockchainTransaction.insertMany([
    {
      recordType: 'CAMPAIGN', recordId: camp1._id.toString(),
      dataHash: hash({ title: 'Diwali Festive Sale 2024', budget: 500000, objective: 'conversions', advertiser: adv1._id.toString() }),
      txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
      blockNumber: 1042, contractAddress: '0xDEADBEEF0000000000000000000000000000DEAD',
      recordedBy: adv1._id, status: 'confirmed',
    },
    {
      recordType: 'CAMPAIGN', recordId: camp2._id.toString(),
      dataHash: hash({ title: 'BharatPay App Launch', budget: 300000, objective: 'lead_generation', advertiser: adv1._id.toString() }),
      txHash: '0xdef789abc012def789abc012def789abc012def789abc012def789abc012def7',
      blockNumber: 1043, contractAddress: '0xDEADBEEF0000000000000000000000000000DEAD',
      recordedBy: adv1._id, status: 'confirmed',
    },
    {
      recordType: 'PURCHASE', recordId: mp1._id.toString(),
      dataHash: hash({ campaign: camp1._id.toString(), publisher: pb1._id.toString(), totalCost: 56000, quantity: 200, status: 'approved' }),
      txHash: '0x111aaa222bbb333ccc444ddd555eee666fff777aaa888bbb999ccc000ddd111a',
      blockNumber: 1055, contractAddress: '0xDEADBEEF0000000000000000000000000000DEAD',
      recordedBy: admin._id, status: 'confirmed',
    },
    {
      recordType: 'PURCHASE', recordId: mp2._id.toString(),
      dataHash: hash({ campaign: camp1._id.toString(), publisher: pb2._id.toString(), totalCost: 100800, quantity: 300, status: 'approved' }),
      txHash: '0x222bbb333ccc444ddd555eee666fff777aaa888bbb999ccc000ddd111aaa222b',
      blockNumber: 1056, contractAddress: '0xDEADBEEF0000000000000000000000000000DEAD',
      recordedBy: admin._id, status: 'confirmed',
    },
    {
      recordType: 'REPORT', recordId: rep1._id.toString(),
      dataHash: hash({ campaign: camp1._id.toString(), publisher: pb1._id.toString(), impressions: 185000, clicks: 4625, spend: 46250, status: 'approved' }),
      txHash: '0x333ccc444ddd555eee666fff777aaa888bbb999ccc000ddd111aaa222bbb333c',
      blockNumber: 1070, contractAddress: '0xDEADBEEF0000000000000000000000000000DEAD',
      recordedBy: admin._id, status: 'confirmed',
    },
    {
      recordType: 'REPORT', recordId: rep2._id.toString(),
      dataHash: hash({ campaign: camp1._id.toString(), publisher: pb2._id.toString(), impressions: 270000, clicks: 8100, spend: 81000, status: 'approved' }),
      recordedBy: admin._id, status: 'pending',
    },
  ]);
  console.log('Blockchain Transactions created');

  // ── Audit Logs ─────────────────────────────────────────────
  await AuditLog.insertMany([
    { action: 'CREATE', entity: 'Campaign', entityId: camp1._id.toString(), performedBy: adv1._id, role: 'advertiser', details: { title: 'Diwali Festive Sale 2024', budget: 500000 }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'Campaign', entityId: camp2._id.toString(), performedBy: adv1._id, role: 'advertiser', details: { title: 'BharatPay App Launch', budget: 300000 }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'Campaign', entityId: camp3._id.toString(), performedBy: adv2._id, role: 'advertiser', details: { title: 'Kapoor Motors Brand Awareness', budget: 750000 }, ipAddress: '::1' },
    { action: 'UPDATE', entity: 'Campaign', entityId: camp1._id.toString(), performedBy: adv1._id, role: 'advertiser', details: { status: 'active' }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'MediaPurchase', entityId: mp1._id.toString(), performedBy: adv1._id, role: 'advertiser', details: { campaign: camp1._id, totalCost: 56000 }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'MediaPurchase', entityId: mp2._id.toString(), performedBy: adv1._id, role: 'advertiser', details: { campaign: camp1._id, totalCost: 100800 }, ipAddress: '::1' },
    { action: 'APPROVED', entity: 'MediaPurchase', entityId: mp1._id.toString(), performedBy: admin._id, role: 'admin', details: { status: 'approved' }, ipAddress: '::1' },
    { action: 'APPROVED', entity: 'MediaPurchase', entityId: mp2._id.toString(), performedBy: admin._id, role: 'admin', details: { status: 'approved' }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'DeliveryReport', entityId: rep1._id.toString(), performedBy: pub1._id, role: 'publisher', details: { mediaPurchaseId: mp1._id, isFlagged: false }, ipAddress: '::1' },
    { action: 'CREATE', entity: 'DeliveryReport', entityId: rep2._id.toString(), performedBy: pub2._id, role: 'publisher', details: { mediaPurchaseId: mp2._id, isFlagged: false }, ipAddress: '::1' },
    { action: 'APPROVED', entity: 'DeliveryReport', entityId: rep1._id.toString(), performedBy: admin._id, role: 'admin', details: { status: 'approved' }, ipAddress: '::1' },
    { action: 'DISPUTED', entity: 'DeliveryReport', entityId: rep4._id.toString(), performedBy: adv2._id, role: 'advertiser', details: { status: 'disputed' }, ipAddress: '::1' },
  ]);
  console.log('Audit Logs created');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('Login credentials (all passwords: Password@123)');
  console.log('─────────────────────────────────────────');
  console.log('Admin      → admin@atts.com');
  console.log('Advertiser → priya@brandsindia.com');
  console.log('Advertiser → rohan@kapooradv.com');
  console.log('Agency     → sneha@iyermedia.com');
  console.log('Agency     → vikram@nairagency.com');
  console.log('Publisher  → ananya@reddynews.com');
  console.log('Publisher  → karthik@pillaitech.com');
  console.log('Publisher  → deepika@joshimedia.com');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
