import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from './services/cloudinary.js';
import authRoutes from './routes/auth.js';
import flatRoutes from './routes/flats.js';
import reservationRoutes from './routes/reservations.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';
import { storage } from './store/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS.'));
  }
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/flats', flatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'KEFFI APARTMENT SUITES Guest Management System API',
    version: '1.0.0',
    fileStorage: isCloudinaryConfigured ? 'cloudinary' : 'unconfigured',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Catch-all for SPA client routing (prevent 404 on refresh)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

app.use((err, req, res, next) => {
  void next;
  console.error('Unhandled API Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: `File is too large. Maximum size is ${process.env.MAX_UPLOAD_MB || 10}MB.`
      });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CloudinaryError') {
    return res.status(err.status || 502).json({ message: err.message });
  }

  // Errors that already carry a client-error status (e.g. a rejected upload
  // type) should surface as that status rather than a generic 500.
  if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err.message === 'Origin not allowed by CORS.') {
    return res.status(403).json({ message: err.message });
  }

  return res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

async function startServer() {
  await storage.init();

  app.listen(PORT, () => {
    console.log('===================================================');
    console.log('  KEFFI APARTMENT SUITES BACKEND API RUNNING');
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health`);
    console.log('===================================================');
  });
}

startServer().catch(error => {
  console.error('Failed to start API server:', error.message);
  process.exit(1);
});
