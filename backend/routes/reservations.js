import express from 'express';
import { storage, redactReservationForPublic } from '../store/storage.js';
import { authenticateToken } from './auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const submissionLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 12,
  message: 'Too many reservation requests. Please wait and try again.'
});

router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, flat, search } = req.query;
  const reservations = await storage.getReservations({ status, flat, search });
  return res.json(reservations);
}));

router.get('/check-conflict', asyncHandler(async (req, res) => {
  const { flat, checkInDate, checkOutDate, excludeId } = req.query;
  const conflict = await storage.checkFlatConflict(flat, checkInDate, checkOutDate, excludeId);

  if (conflict) {
    return res.json({
      available: false,
      message: `Flat "${flat}" is already booked for the selected dates.`
    });
  }

  return res.json({ available: true, message: `Flat "${flat}" is available for the selected dates.` });
}));

router.get('/:passId', asyncHandler(async (req, res) => {
  const reservation = await storage.getReservationByIdOrPassId(req.params.passId);

  if (!reservation) {
    return res.status(404).json({ message: 'Reservation or Gate Pass not found.' });
  }

  return res.json(redactReservationForPublic(reservation));
}));

router.post('/', submissionLimiter, asyncHandler(async (req, res) => {
  const payload = req.body;

  if (!payload.guestName || !payload.flat || !payload.phone || !payload.checkInDate || !payload.checkOutDate) {
    return res.status(400).json({
      message: 'Required fields missing: Full Name, Phone Number, Flat, Check-in Date, and Check-out Date are mandatory.'
    });
  }

  try {
    const created = await storage.createReservation(payload);

    return res.status(201).json({
      message: created.autoApproved
        ? 'Reservation submitted and automatically approved. Your Gate Pass is ready.'
        : 'Reservation submitted and flagged for Facility Manager review.',
      reservation: redactReservationForPublic(created)
    });
  } catch (error) {
    const statusCode = error.status || (error.message.includes('booked') ? 409 : 400);
    return res.status(statusCode).json({ message: error.message || 'Failed to create reservation.' });
  }
}));

router.patch('/:id/status', authenticateToken, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['Approved', 'Active', 'Upcoming', 'Pending Review', 'Rejected', 'Expired'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updated = await storage.updateReservationStatus(req.params.id, status, notes, req.user.id);
  if (!updated) {
    return res.status(404).json({ message: 'Reservation not found.' });
  }

  return res.json({ message: `Reservation status updated to ${status}.`, reservation: updated });
}));

router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const updated = await storage.updateReservation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    return res.json({ message: 'Reservation updated successfully.', reservation: updated });
  } catch (error) {
    const statusCode = error.status || (error.message.includes('booked') ? 409 : 400);
    return res.status(statusCode).json({ message: error.message || 'Failed to update reservation.' });
  }
}));

export default router;
