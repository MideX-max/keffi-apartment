# KEFFI APARTMENT SUITES - Backend API

Express.js backend with PostgreSQL for the KEFFI APARTMENT SUITES Guest Management System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database configuration
# Start server
npm start
```

## 🔧 Environment Variables

Required variables in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=false
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
ADMIN_BOOTSTRAP_PASSWORD=admin123456
ADMIN_BOOTSTRAP_EMAIL=admin@keffi.com
PORT=5000
NODE_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin (requires auth)
- `PUT /api/auth/settings` - Update admin settings (requires auth)

### Reservations
- `GET /api/reservations` - Get all reservations (requires auth)
- `GET /api/reservations/:id` - Get reservation by ID or pass ID
- `POST /api/reservations` - Create new reservation
- `PATCH /api/reservations/:id/status` - Update reservation status (requires auth)
- `GET /api/reservations/check-conflict` - Check flat availability

### Flats
- `GET /api/flats` - Get all flats (requires auth)
- `POST /api/flats` - Add new flat (requires auth)
- `PATCH /api/flats/:id` - Update flat (requires auth)

### Stats
- `GET /api/stats` - Get dashboard statistics (requires auth)
- `POST /api/stats/reset` - Reset all data (requires auth)

### Upload
- `POST /api/upload` - Upload file (documents, photos, signatures)

### Health
- `GET /api/health` - API health check

## 🗄️ Database Schema

### Tables
- `admins` - Administrator accounts
- `flats` - Apartment/suite inventory
- `reservations` - Guest bookings

The system automatically creates tables and seeds initial data on first run.

## 🔐 Security Features

- JWT authentication with configurable expiry
- Rate limiting on login attempts
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Password hashing with bcrypt (12 rounds)
- SQL injection prevention via parameterized queries

## 🔄 Data Reset

The system includes a data reset function for periodic cleanup:

```bash
POST /api/stats/reset
```

This deletes all reservations, flats, and admins, then reseeds fresh data. Requires admin authentication.

## 📦 Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with hot reload
```

## 🌐 Development

The server runs on port 5000 by default. In development mode, it uses file watching for automatic restarts.

API Health Check: http://localhost:5000/api/health
