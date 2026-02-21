/**
 * DJ03 Booking API Server
 * Express backend for handling booking form submissions and sending email notifications.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const bookRouter = require('./routes/book');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// CORS: allow frontend origin (adjust in production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'file://'],
  credentials: true
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'DJ03 Booking API is running' });
});

// Booking route
app.use('/api', bookRouter);

// Serve static files from parent directory (optional – for local dev)
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`DJ03 Booking API running on http://localhost:${PORT}`);
});
