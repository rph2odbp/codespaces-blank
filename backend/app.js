require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
// ...existing code...
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// --- Route Imports ---
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const campersRoutes = require('./routes/campers');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Route Registration ---
app.use('/api/parent', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/campers', campersRoutes);

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Camp Abbey API is running!');
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/camp')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});