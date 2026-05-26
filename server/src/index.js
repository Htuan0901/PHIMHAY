const app = require('./app');
const config = require('./config');
const mongoose = require('mongoose');

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
};

function logEnvCheck() {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`[START] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`[START] PORT=${config.port}`);
  console.log(`[START] MONGODB_URI set: ${!!process.env.MONGODB_URI}`);
  console.log(`[START] JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
  if (isProd) {
    console.log(`[START] CLIENT_URL=${process.env.CLIENT_URL || '(not set)'}`);
  }
}

async function connectMongo() {
  try {
    console.log('[START] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, mongoOptions);
    console.log('[START] MongoDB connected');
    return true;
  } catch (err) {
    console.error('[WARN] MongoDB connection failed:', err.message);
    console.error('[HINT] Check MONGODB_URI on Render and Atlas Network Access (0.0.0.0/0).');
    console.error('[HINT] Server is running; /api/health will show mongo:false until DB connects.');
    return false;
  }
}

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  logEnvCheck();

  if (isProd && !process.env.MONGODB_URI) {
    console.error('[FATAL] MONGODB_URI is not set. Add it in Render → Environment.');
    process.exit(1);
  }

  if (isProd && (!process.env.JWT_SECRET || config.jwtSecret === 'dev-only-change-me')) {
    console.error('[FATAL] JWT_SECRET is not set. Add a long random value in Render → Environment.');
    process.exit(1);
  }

  // Bind port first so Render sees the service as "up"
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[START] Server listening on http://0.0.0.0:${config.port}`);
  });

  await connectMongo();
}

main().catch((e) => {
  console.error('[FATAL] Startup error:', e);
  process.exit(1);
});
