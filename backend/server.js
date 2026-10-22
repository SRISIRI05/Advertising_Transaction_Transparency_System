require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initBlockchain } = require('./src/blockchainService');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/campaigns', require('./src/routes/campaigns'));
app.use('/api/agencies', require('./src/routes/agencies'));
app.use('/api/publishers', require('./src/routes/publishers'));
app.use('/api/purchases', require('./src/routes/mediaPurchases'));
app.use('/api/reports', require('./src/routes/deliveryReports'));
app.use('/api/blockchain', require('./src/routes/blockchain'));
app.use('/api/payments', require('./src/routes/payments'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    initBlockchain();
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('DB connection failed:', err));
