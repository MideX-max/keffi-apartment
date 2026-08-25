# Project-Specific Information

## Build Commands

```bash
# Development
npm run dev:all          # Start both frontend and backend
npm run dev              # Frontend only (Vite dev server)
npm run server           # Backend only (Express dev server)

# Production
npm run build            # Build frontend for production
npm start                # Start backend with frontend served
```

## Verification Commands

```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend development
cd keffi-apartment-suites
npm run dev

# Backend development
cd server
npm run dev

# Linting
cd keffi-apartment-suites
npm run lint
```

## Project Structure

- **Frontend**: React 19 + Vite in `keffi-apartment-suites/`
- **Backend**: Express.js + PostgreSQL in `server/`
- **Database**: PostgreSQL (local or Supabase)
- **Authentication**: JWT tokens
- **File Upload**: Multer with local storage in `server/uploads/`

## Key Features

- Guest registration with document upload
- Digital signature capture
- PDF pass generation
- Admin dashboard with statistics
- Real-time reservation management
- 60-day data reset functionality

## Environment Variables

### Required Backend Variables (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random string for token signing
- `CORS_ORIGIN` - Frontend URL for CORS
- `ADMIN_BOOTSTRAP_PASSWORD` - Initial admin password

### Frontend Variables (.env)
- `VITE_API_URL` - Backend API URL

## Database Schema

Tables are auto-created on first run:
- `admins` - Administrator accounts
- `flats` - Apartment inventory
- `reservations` - Guest bookings

## Important Notes

- Server expects `server/uploads/` directory to exist for file uploads
- System auto-seeds initial flats and admin user on first run
- Data reset available via `POST /api/stats/reset` endpoint
- JWT tokens expire after 8 hours (configurable)
- Rate limiting on login: 8 attempts per 15 minutes

## 60-Day Reset Implementation

The system includes a built-in data reset function:
- Backend endpoint: `POST /api/stats/reset`
- Frontend API function: `api.resetData(token)`
- Deletes all data and reseeds fresh flats and admin
- Requires admin authentication
