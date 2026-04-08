// backend/server.js
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes   = require('./routes/authRoutes');
const itemRoutes   = require('./routes/itemRoutes');

// Initialize DB connection pool (side-effect import)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Core Middleware ──────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/items', itemRoutes);

// Stats shortcut (same controller, also mounted under /api/items/stats)
// Keeping a top-level alias for convenience
app.get('/api/stats', require('./middleware/auth').protect, require('./controllers/itemController').getStats);

// Health check
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is running' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database    : ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);
});
