const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const adminRoutes = require('./routes/admin/index');
const settingsRoutes = require('./routes/settings');
const categoriesRoutes = require('./routes/categories');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');
const { optionalAuth } = require('./middleware/auth');
const { maintenanceCheck } = require('./middleware/maintenance');
const commentsRoutes = require('./routes/comments');
const ratingsRoutes = require('./routes/ratings');
const paymentRoutes = require('./routes/payment');
const historyRoutes = require('./routes/history');
const { setupSwagger } = require('./docs/swagger');

const app = express();
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';
const clientDist = path.join(__dirname, '../../client/dist');
const hasClientBuild = isProd && fs.existsSync(clientDist);

app.use((req, res, next) => {
  console.log(`[REQUEST START] ${new Date().toISOString()} | ${req.method} ${req.originalUrl || req.url}`);
  next();
});

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
    optionsSuccessStatus: 204
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(apiLimiter);

app.use(async (req, _res, next) => {
  try {
    console.log(`[DB CHECK] ${new Date().toISOString()} | Checking connection for ${req.url}...`);
    await connectDB();
    console.log(`[DB CHECK] ${new Date().toISOString()} | Connection Ready. Proceeding.`);
    next();
  } catch (error) {
    console.error(`[DB ERROR] ${new Date().toISOString()} | Failed to connect:`, error);
    next(error);
  }
});

if (!hasClientBuild) {
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!', time: new Date() });
  });
}

app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.use(optionalAuth);
app.use(maintenanceCheck);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/movies', (req, res, next) => {
  console.log(`[ROUTE] ${new Date().toISOString()} | Entering moviesRoutes handler...`);
  next();
}, moviesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/history', historyRoutes);
setupSwagger(app);

if (hasClientBuild) {
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not Found', path: req.originalUrl });
  }
  res.status(404).send('Not Found');
});

app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

module.exports = app;
