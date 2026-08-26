import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../store/storage.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Generate a long random value and set it in server/.env.');
}

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'Too many login attempts. Please wait and try again.'
});

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    req.user = user;
    return next();
  });
};

function publicAdmin(admin) {
  const { passwordHash, ...adminData } = admin;
  return adminData;
}

// Rate limiting disabled for development/testing
// router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const admin = await storage.getAdmin();
  const normalizedEmail = String(email).trim().toLowerCase();
  const isEmailMatch = admin?.email?.toLowerCase() === normalizedEmail;
  const isPasswordValid = admin?.passwordHash
    ? await bcrypt.compare(String(password), admin.passwordHash)
    : false;

  if (!isEmailMatch || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

  return res.json({
    message: 'Login successful',
    token,
    user: publicAdmin(admin)
  });
}));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const admin = await storage.getAdmin();
  return res.json(publicAdmin(admin));
}));

router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (updates.newPassword) {
    if (String(updates.newPassword).length < 10) {
      return res.status(400).json({ message: 'New password must be at least 10 characters.' });
    }

    updates.passwordHash = await bcrypt.hash(String(updates.newPassword), 12);
    delete updates.newPassword;
  }

  const updatedAdmin = await storage.updateAdmin(updates);
  return res.json({ message: 'Settings updated successfully', admin: publicAdmin(updatedAdmin) });
}));

export default router;
