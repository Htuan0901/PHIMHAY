const app = require('./app');
const config = require('./config');
const mongoose = require('mongoose');

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
};

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !process.env.MONGODB_URI) {
    console.error('[FATAL] MONGODB_URI is not set. Add it in Render Environment variables.');
    process.exit(1);
  }

  if (isProd && config.jwtSecret === 'dev-only-change-me') {
    console.error('[FATAL] JWT_SECRET must be set in production (not the dev default).');
    process.exit(1);
  }

  console.log(`[START] NODE_ENV=${process.env.NODE_ENV || 'development'} PORT=${config.port}`);

  try {
    console.log('[START] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, mongoOptions);
    console.log('[START] MongoDB connected');
  } catch (err) {
    console.error('[FATAL] MongoDB connection failed:', err.message);
    console.error('[HINT] Set MONGODB_URI on Render and allow 0.0.0.0/0 in Atlas Network Access.');
    process.exit(1);
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[START] Server listening on http://0.0.0.0:${config.port}`);
  });
}

main().catch((e) => {
  console.error('[FATAL] Startup error:', e);
  process.exit(1);
});
