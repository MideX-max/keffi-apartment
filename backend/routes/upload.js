import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRateLimiter } from '../middleware/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const extensionByMime = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many uploads. Please wait and try again.'
});

function detectFileType(buffer) {
  if (buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) return 'application/pdf';
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';

  const riff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
  const webp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (riff && webp) return 'image/webp';

  return null;
}

function removeQuietly(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // Best effort cleanup for rejected uploads.
  }
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const requestedMime = allowedMimeTypes.has(file.mimetype) ? file.mimetype : 'application/octet-stream';
    const ext = extensionByMime[requestedMime] || '.bin';
    cb(null, `${file.fieldname}-${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error('Only PDF, JPEG, PNG, and WEBP files are allowed.'));
  }
});

const router = express.Router();

router.post('/', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const detectedMime = detectFileType(fileBuffer);

  if (!detectedMime || detectedMime !== req.file.mimetype) {
    removeQuietly(req.file.path);
    return res.status(400).json({ message: 'Uploaded file content does not match an allowed file type.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    message: 'File uploaded successfully',
    fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimetype: detectedMime
  });
});

export default router;
