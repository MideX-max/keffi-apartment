import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { DEFAULT_MANAGER_SIGNATURE, INITIAL_MANAGERS, INITIAL_FLATS } from '../data/seedData.js';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (!DATABASE_URL) {
  throw new Error(
    'postgresql://postgres.eruvbugvshnfbpyjsnow:keffiapartmen@aws-0-eu-west-2.pooler.supabase.com:6543/postgres'
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: Number(process.env.DB_POOL_SIZE || 10),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

function toDateOnly(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toTimeOnly(value, fallback) {
  if (!value) return fallback;
  return String(value).slice(0, 5);
}

function cleanString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function isTerminalStatus(status) {
  return status === 'Rejected' || status === 'Pending Review';
}

function generateRecordId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function generatePassId() {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `KAS-${dateStamp}-${suffix}`;
}

function validateDateRange(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw new Error('A valid check-in and check-out date are required.');
  }

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be strictly after check-in date.');
  }
}

function adminFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || '',
    estateName: row.estate_name,
    estateAddress: row.estate_address,
    gateContact: row.gate_contact,
    defaultSignature: row.default_signature || DEFAULT_MANAGER_SIGNATURE,
    autoApprovalEnabled: row.auto_approval_enabled,
    strictIdCheck: row.strict_id_check,
    notificationEmail: row.notification_email || ''
  };
}

function reservationFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    passId: row.pass_id,
    guestName: row.guest_name,
    email: row.email || '',
    phone: row.phone || '',
    guestCount: Number(row.guest_count || 1),
    purpose: row.purpose || 'Apartment Stay',
    flat: row.flat,
    checkInDate: toDateOnly(row.check_in_date),
    checkOutDate: toDateOnly(row.check_out_date),
    checkInTime: toTimeOnly(row.check_in_time, '14:00'),
    checkOutTime: toTimeOnly(row.check_out_time, '11:00'),
    idType: row.id_type || 'National Identification Number (NIN)',
    idNumber: row.id_number || '',
    idDocumentName: row.id_document_name || '',
    idDocumentUrl: row.id_document_url || '',
    photoUrl: row.photo_url || '',
    signatureUrl: row.signature_url || '',
    managerSignatureUrl: row.manager_signature_url || DEFAULT_MANAGER_SIGNATURE,
    status: row.status,
    autoApproved: row.auto_approved,
    verificationNotes: row.verification_notes || '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    submittedBy: row.submitted_by || 'Guest / Representative'
  };
}

function flatFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    block: row.block,
    floor: row.floor,
    type: row.type,
    status: row.status,
    currentGuest: row.current_guest || null,
    currentPassId: row.current_pass_id || null,
    description: row.description || ''
  };
}

export function redactReservationForPublic(reservation) {
  if (!reservation) return null;
  return {
    id: reservation.id,
    passId: reservation.passId,
    guestName: reservation.guestName,
    flat: reservation.flat,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    checkInTime: reservation.checkInTime,
    checkOutTime: reservation.checkOutTime,
    status: reservation.status,
    managerSignatureUrl: reservation.managerSignatureUrl,
    signatureUrl: reservation.status === 'Pending Review' ? '' : reservation.signatureUrl,
    createdAt: reservation.createdAt
  };
}

class StorageEngine {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async init() {
    await this.pool.query('SELECT 1');
    await this.migrate();
    await this.seedFlats();
    await this.seedAdmin();
  }

  async migrate() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        phone TEXT,
        estate_name TEXT NOT NULL,
        estate_address TEXT NOT NULL,
        gate_contact TEXT NOT NULL,
        default_signature TEXT,
        auto_approval_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        strict_id_check BOOLEAN NOT NULL DEFAULT TRUE,
        notification_email TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS flats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        block TEXT NOT NULL,
        floor TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        current_guest TEXT,
        current_pass_id TEXT,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        pass_id TEXT NOT NULL UNIQUE,
        guest_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        guest_count INTEGER NOT NULL DEFAULT 1,
        purpose TEXT,
        flat TEXT NOT NULL REFERENCES flats(name) ON UPDATE CASCADE,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        check_in_time TIME NOT NULL DEFAULT '14:00',
        check_out_time TIME NOT NULL DEFAULT '11:00',
        id_type TEXT,
        id_number TEXT,
        id_document_name TEXT,
        id_document_url TEXT,
        photo_url TEXT,
        signature_url TEXT,
        manager_signature_url TEXT,
        status TEXT NOT NULL,
        auto_approved BOOLEAN NOT NULL DEFAULT FALSE,
        verification_notes TEXT,
        submitted_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT reservations_valid_date_range CHECK (check_out_date > check_in_date)
      );

      CREATE INDEX IF NOT EXISTS reservations_pass_id_idx ON reservations (pass_id);
      CREATE INDEX IF NOT EXISTS reservations_flat_dates_idx ON reservations (LOWER(flat), check_in_date, check_out_date);
      CREATE INDEX IF NOT EXISTS reservations_status_idx ON reservations (status);
      CREATE INDEX IF NOT EXISTS reservations_created_at_idx ON reservations (created_at DESC);
    `);
  }

  async dropAllTables() {
    await this.pool.query('DROP TABLE IF EXISTS reservations CASCADE');
    await this.pool.query('DROP TABLE IF EXISTS flats CASCADE');
    await this.pool.query('DROP TABLE IF EXISTS admins CASCADE');
  }

  async seedFlats() {
    for (const flat of INITIAL_FLATS) {
      await this.pool.query(
        `
          INSERT INTO flats (id, name, block, floor, type, status, current_guest, current_pass_id, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (name) DO UPDATE SET
            block = EXCLUDED.block,
            floor = EXCLUDED.floor,
            type = EXCLUDED.type,
            description = EXCLUDED.description
        `,
        [
          flat.id,
          flat.name,
          flat.block,
          flat.floor,
          flat.type,
          flat.status,
          flat.currentGuest,
          flat.currentPassId,
          flat.description
        ]
      );
    }
  }

  async seedAdmin() {
    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS count FROM admins');
    if (rows[0].count > 0) return;

    // Seed multiple managers with their specific passwords
    for (const manager of INITIAL_MANAGERS) {
      const passwordHash = await bcrypt.hash(manager.password, 12);
      
      await this.pool.query(
        `
          INSERT INTO admins (
            id, name, role, email, password_hash, phone, estate_name, estate_address,
            gate_contact, default_signature, auto_approval_enabled, strict_id_check, notification_email
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (email) DO NOTHING
        `,
        [
          manager.id,
          manager.name,
          manager.role,
          manager.email,
          passwordHash,
          manager.phone,
          manager.estateName,
          manager.estateAddress,
          manager.gateContact,
          manager.defaultSignature,
          manager.autoApprovalEnabled,
          manager.strictIdCheck,
          manager.notificationEmail
        ]
      );
    }

    console.log('Created development manager accounts:');
    for (const manager of INITIAL_MANAGERS) {
      console.warn(`  email: ${manager.email}`);
      console.warn(`  password: ${manager.password}`);
    }
    console.warn('For production, set individual manager passwords in environment variables.');
  }

  computeStatus(reservation) {
    if (isTerminalStatus(reservation.status)) return reservation.status;

    const now = new Date();
    const checkIn = new Date(`${reservation.checkInDate}T${reservation.checkInTime || '00:00'}:00`);
    const checkOut = new Date(`${reservation.checkOutDate}T${reservation.checkOutTime || '23:59'}:00`);

    if (now > checkOut) return 'Expired';
    if (now >= checkIn && now <= checkOut) return 'Active';
    return 'Upcoming';
  }

  withDynamicStatus(reservation) {
    if (!reservation) return null;
    return { ...reservation, status: this.computeStatus(reservation) };
  }

  async checkFlatConflict(flatName, checkInDate, checkOutDate, excludeReservationId = null) {
    if (!flatName || !checkInDate || !checkOutDate) return null;
    validateDateRange(checkInDate, checkOutDate);

    const { rows } = await this.pool.query(
      `
        SELECT *
        FROM reservations
        WHERE LOWER(flat) = LOWER($1)
          AND status NOT IN ('Rejected', 'Expired')
          AND check_out_date >= CURRENT_DATE
          AND $2::date < check_out_date
          AND $3::date > check_in_date
          AND ($4::text IS NULL OR (id <> $4 AND pass_id <> $4))
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [cleanString(flatName), checkInDate, checkOutDate, excludeReservationId]
    );

    return this.withDynamicStatus(reservationFromRow(rows[0]));
  }

  async getReservations(filters = {}) {
    const { rows } = await this.pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    let list = rows.map(row => this.withDynamicStatus(reservationFromRow(row)));

    if (filters.status && filters.status !== 'All') {
      list = list.filter(reservation => reservation.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.flat && filters.flat !== 'All') {
      list = list.filter(reservation => reservation.flat.toLowerCase() === filters.flat.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(reservation =>
        reservation.guestName.toLowerCase().includes(q) ||
        reservation.passId.toLowerCase().includes(q) ||
        reservation.flat.toLowerCase().includes(q) ||
        reservation.phone.includes(q) ||
        reservation.email.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getReservationByIdOrPassId(identifier) {
    const { rows } = await this.pool.query(
      'SELECT * FROM reservations WHERE id = $1 OR LOWER(pass_id) = LOWER($1) LIMIT 1',
      [identifier]
    );
    return this.withDynamicStatus(reservationFromRow(rows[0]));
  }

  async createReservation(payload) {
    const guestName = cleanString(payload.guestName);
    const flat = cleanString(payload.flat);
    const phone = cleanString(payload.phone);
    const checkInDate = toDateOnly(payload.checkInDate);
    const checkOutDate = toDateOnly(payload.checkOutDate);

    if (!guestName || !flat || !phone || !checkInDate || !checkOutDate) {
      throw new Error('Full Name, Phone Number, Flat, Check-in Date, and Check-out Date are required.');
    }

    validateDateRange(checkInDate, checkOutDate);

    const conflict = await this.checkFlatConflict(flat, checkInDate, checkOutDate);
    if (conflict) {
      throw new Error(`Flat "${flat}" is already booked for those dates.`);
    }

    const admin = await this.getAdmin();
    const hasIdentity = Boolean(cleanString(payload.idDocumentUrl) || cleanString(payload.idNumber));
    const hasSignature = Boolean(cleanString(payload.signatureUrl));
    const autoApproved = hasIdentity && hasSignature;
    const verificationNotes = autoApproved
      ? 'Automated validation passed all checks.'
      : 'Flagged: identity document/number and guest signature are required before approval.';

    const record = {
      id: generateRecordId('res'),
      passId: payload.passId || generatePassId(),
      guestName,
      email: cleanString(payload.email),
      phone,
      guestCount: Math.max(1, Number.parseInt(payload.guestCount, 10) || 1),
      purpose: cleanString(payload.purpose, 'Apartment Stay'),
      flat,
      checkInDate,
      checkOutDate,
      checkInTime: toTimeOnly(payload.checkInTime, '14:00'),
      checkOutTime: toTimeOnly(payload.checkOutTime, '11:00'),
      idType: cleanString(payload.idType, 'National Identification Number (NIN)'),
      idNumber: cleanString(payload.idNumber),
      idDocumentName: cleanString(payload.idDocumentName),
      idDocumentUrl: cleanString(payload.idDocumentUrl),
      photoUrl: cleanString(payload.photoUrl),
      signatureUrl: cleanString(payload.signatureUrl),
      managerSignatureUrl: admin?.defaultSignature || DEFAULT_MANAGER_SIGNATURE,
      status: autoApproved ? 'Approved' : 'Pending Review',
      autoApproved,
      verificationNotes,
      submittedBy: cleanString(payload.submittedBy, 'Guest / Representative')
    };

    const { rows } = await this.pool.query(
      `
        INSERT INTO reservations (
          id, pass_id, guest_name, email, phone, guest_count, purpose, flat,
          check_in_date, check_out_date, check_in_time, check_out_time,
          id_type, id_number, id_document_name, id_document_url, photo_url,
          signature_url, manager_signature_url, status, auto_approved,
          verification_notes, submitted_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20, $21,
          $22, $23
        )
        RETURNING *
      `,
      [
        record.id,
        record.passId,
        record.guestName,
        record.email,
        record.phone,
        record.guestCount,
        record.purpose,
        record.flat,
        record.checkInDate,
        record.checkOutDate,
        record.checkInTime,
        record.checkOutTime,
        record.idType,
        record.idNumber,
        record.idDocumentName,
        record.idDocumentUrl,
        record.photoUrl,
        record.signatureUrl,
        record.managerSignatureUrl,
        record.status,
        record.autoApproved,
        record.verificationNotes,
        record.submittedBy
      ]
    );

    return this.withDynamicStatus(reservationFromRow(rows[0]));
  }

  async updateReservationStatus(id, newStatus, notes = '') {
    const admin = await this.getAdmin();
    const { rows } = await this.pool.query(
      `
        UPDATE reservations
        SET status = $2,
            verification_notes = COALESCE(NULLIF($3, ''), verification_notes),
            manager_signature_url = CASE WHEN $2 = 'Approved' THEN $4 ELSE manager_signature_url END,
            updated_at = NOW()
        WHERE id = $1 OR pass_id = $1
        RETURNING *
      `,
      [id, newStatus, notes, admin?.defaultSignature || DEFAULT_MANAGER_SIGNATURE]
    );

    return this.withDynamicStatus(reservationFromRow(rows[0]));
  }

  async updateReservation(id, updates) {
    const existing = await this.getReservationByIdOrPassId(id);
    if (!existing) return null;

    const targetFlat = cleanString(updates.flat, existing.flat);
    const targetCheckIn = toDateOnly(updates.checkInDate || existing.checkInDate);
    const targetCheckOut = toDateOnly(updates.checkOutDate || existing.checkOutDate);

    validateDateRange(targetCheckIn, targetCheckOut);

    const conflict = await this.checkFlatConflict(targetFlat, targetCheckIn, targetCheckOut, id);
    if (conflict) {
      throw new Error(`Flat "${targetFlat}" is already booked during those dates.`);
    }

    const next = {
      ...existing,
      ...updates,
      guestName: cleanString(updates.guestName, existing.guestName),
      email: cleanString(updates.email, existing.email),
      phone: cleanString(updates.phone, existing.phone),
      guestCount: Math.max(1, Number.parseInt(updates.guestCount ?? existing.guestCount, 10) || 1),
      purpose: cleanString(updates.purpose, existing.purpose),
      flat: targetFlat,
      checkInDate: targetCheckIn,
      checkOutDate: targetCheckOut,
      checkInTime: toTimeOnly(updates.checkInTime, existing.checkInTime),
      checkOutTime: toTimeOnly(updates.checkOutTime, existing.checkOutTime),
      idType: cleanString(updates.idType, existing.idType),
      idNumber: cleanString(updates.idNumber, existing.idNumber),
      idDocumentName: cleanString(updates.idDocumentName, existing.idDocumentName),
      idDocumentUrl: cleanString(updates.idDocumentUrl, existing.idDocumentUrl),
      photoUrl: cleanString(updates.photoUrl, existing.photoUrl),
      signatureUrl: cleanString(updates.signatureUrl, existing.signatureUrl),
      managerSignatureUrl: cleanString(updates.managerSignatureUrl, existing.managerSignatureUrl),
      status: cleanString(updates.status, existing.status),
      verificationNotes: cleanString(updates.verificationNotes, existing.verificationNotes),
      submittedBy: cleanString(updates.submittedBy, existing.submittedBy)
    };

    const { rows } = await this.pool.query(
      `
        UPDATE reservations
        SET guest_name = $2,
            email = $3,
            phone = $4,
            guest_count = $5,
            purpose = $6,
            flat = $7,
            check_in_date = $8,
            check_out_date = $9,
            check_in_time = $10,
            check_out_time = $11,
            id_type = $12,
            id_number = $13,
            id_document_name = $14,
            id_document_url = $15,
            photo_url = $16,
            signature_url = $17,
            manager_signature_url = $18,
            status = $19,
            verification_notes = $20,
            submitted_by = $21,
            updated_at = NOW()
        WHERE id = $1 OR pass_id = $1
        RETURNING *
      `,
      [
        id,
        next.guestName,
        next.email,
        next.phone,
        next.guestCount,
        next.purpose,
        next.flat,
        next.checkInDate,
        next.checkOutDate,
        next.checkInTime,
        next.checkOutTime,
        next.idType,
        next.idNumber,
        next.idDocumentName,
        next.idDocumentUrl,
        next.photoUrl,
        next.signatureUrl,
        next.managerSignatureUrl,
        next.status,
        next.verificationNotes,
        next.submittedBy
      ]
    );

    return this.withDynamicStatus(reservationFromRow(rows[0]));
  }

  async getFlats() {
    const { rows } = await this.pool.query('SELECT * FROM flats ORDER BY name');
    const reservations = await this.getReservations();
    const now = new Date();

    return rows.map(flatRow => {
      const flat = flatFromRow(flatRow);
      const activeReservation = reservations.find(reservation => {
        if (reservation.flat.toLowerCase() !== flat.name.toLowerCase()) return false;
        if (reservation.status === 'Rejected' || reservation.status === 'Expired') return false;
        const start = new Date(`${reservation.checkInDate}T${reservation.checkInTime || '00:00'}:00`);
        const end = new Date(`${reservation.checkOutDate}T${reservation.checkOutTime || '23:59'}:00`);
        return now >= start && now <= end;
      });

      if (activeReservation) {
        return {
          ...flat,
          status: 'occupied',
          currentGuest: activeReservation.guestName,
          currentPassId: activeReservation.passId
        };
      }

      const upcomingReservation = reservations.find(reservation => {
        if (reservation.flat.toLowerCase() !== flat.name.toLowerCase()) return false;
        if (reservation.status === 'Rejected' || reservation.status === 'Expired') return false;
        const start = new Date(`${reservation.checkInDate}T${reservation.checkInTime || '00:00'}:00`);
        return now < start;
      });

      if (upcomingReservation) {
        return {
          ...flat,
          status: 'reserved',
          currentGuest: upcomingReservation.guestName,
          currentPassId: upcomingReservation.passId
        };
      }

      return { ...flat, status: flat.status || 'available', currentGuest: null, currentPassId: null };
    });
  }

  async addFlat(flatData) {
    const name = cleanString(flatData.name);
    if (!name) throw new Error('Flat name is required.');

    const { rows } = await this.pool.query(
      `
        INSERT INTO flats (id, name, block, floor, type, status, description)
        VALUES ($1, $2, $3, $4, $5, 'available', $6)
        RETURNING *
      `,
      [
        generateRecordId('flat'),
        name,
        cleanString(flatData.block, 'Main Building'),
        cleanString(flatData.floor, '1st Floor'),
        cleanString(flatData.type, 'Standard Suite'),
        cleanString(flatData.description)
      ]
    );

    return flatFromRow(rows[0]);
  }

  async updateFlat(id, updates) {
    const { rows } = await this.pool.query(
      `
        UPDATE flats
        SET name = COALESCE($2, name),
            block = COALESCE($3, block),
            floor = COALESCE($4, floor),
            type = COALESCE($5, type),
            status = COALESCE($6, status),
            description = COALESCE($7, description),
            updated_at = NOW()
        WHERE id = $1 OR name = $1
        RETURNING *
      `,
      [
        id,
        updates.name ? cleanString(updates.name) : null,
        updates.block ? cleanString(updates.block) : null,
        updates.floor ? cleanString(updates.floor) : null,
        updates.type ? cleanString(updates.type) : null,
        updates.status ? cleanString(updates.status) : null,
        updates.description !== undefined ? cleanString(updates.description) : null
      ]
    );

    return rows[0] ? flatFromRow(rows[0]) : null;
  }

  async getAdmin() {
    const { rows } = await this.pool.query('SELECT * FROM admins ORDER BY created_at ASC LIMIT 1');
    return adminFromRow(rows[0]);
  }

  async updateAdmin(updates) {
    const current = await this.getAdmin();
    if (!current) return null;

    const { rows } = await this.pool.query(
      `
        UPDATE admins
        SET name = $2,
            role = $3,
            email = $4,
            password_hash = COALESCE($5, password_hash),
            phone = $6,
            estate_name = $7,
            estate_address = $8,
            gate_contact = $9,
            default_signature = $10,
            auto_approval_enabled = $11,
            strict_id_check = $12,
            notification_email = $13,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        current.id,
        cleanString(updates.name, current.name),
        cleanString(updates.role, current.role),
        cleanString(updates.email, current.email),
        updates.passwordHash || null,
        cleanString(updates.phone, current.phone),
        cleanString(updates.estateName, current.estateName),
        cleanString(updates.estateAddress, current.estateAddress),
        cleanString(updates.gateContact, current.gateContact),
        cleanString(updates.defaultSignature, current.defaultSignature),
        updates.autoApprovalEnabled ?? current.autoApprovalEnabled,
        updates.strictIdCheck ?? current.strictIdCheck,
        cleanString(updates.notificationEmail, current.notificationEmail)
      ]
    );

    return adminFromRow(rows[0]);
  }

  async getStats() {
    const [reservations, flats] = await Promise.all([this.getReservations(), this.getFlats()]);
    const totalGuests = reservations.reduce((sum, reservation) => sum + (reservation.guestCount || 1), 0);
    const active = reservations.filter(reservation => reservation.status === 'Active').length;
    const upcoming = reservations.filter(reservation => reservation.status === 'Upcoming' || reservation.status === 'Approved').length;
    const pending = reservations.filter(reservation => reservation.status === 'Pending Review').length;
    const expired = reservations.filter(reservation => reservation.status === 'Expired').length;
    const occupiedFlats = flats.filter(flat => flat.status === 'occupied').length;

    return {
      totalReservations: reservations.length,
      totalGuests,
      activeReservations: active,
      upcomingReservations: upcoming,
      pendingReview: pending,
      expiredPasses: expired,
      totalFlats: flats.length,
      occupiedFlats,
      occupancyRate: flats.length > 0 ? Math.round((occupiedFlats / flats.length) * 100) : 0
    };
  }

  async resetAllData() {
    await this.pool.query('DELETE FROM reservations');
    await this.pool.query('DELETE FROM flats');
    await this.pool.query('DELETE FROM admins');
    
    // Try to reset sequences, but ignore if they don't exist
    try {
      await this.pool.query('ALTER SEQUENCE flats_id_seq RESTART WITH 1');
    } catch (e) {
      // Sequence might not exist, ignore
    }
    try {
      await this.pool.query('ALTER SEQUENCE admins_id_seq RESTART WITH 1');
    } catch (e) {
      // Sequence might not exist, ignore
    }
    
    await this.seedFlats();
    await this.seedAdmin();
    return { message: 'All data has been reset successfully' };
  }
}
