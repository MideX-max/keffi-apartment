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
cd frontend
npm run dev

# Backend development
cd backend
npm run dev

# Linting
cd frontend
npm run lint
```

## Project Structure

- **Frontend**: React 19 + Vite in `frontend/`
- **Backend**: Express.js + MongoDB (Mongoose) in `backend/`
- **Database**: MongoDB (local or MongoDB Atlas)
- **Authentication**: JWT tokens
- **File Upload**: Multer (memory) → Cloudinary; see `server/services/cloudinary.js`
- **File Storage**: Cloudinary is the single source of truth for all uploaded images and files

## Key Features

- Guest registration with document upload
- Digital signature capture
- PDF pass generation
- Admin dashboard with statistics
- Real-time reservation management
- 60-day data reset functionality

## Environment Variables

### Required Backend Variables (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secure random string for token signing
- `CORS_ORIGIN` - Frontend URL for CORS
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - file storage
- `CLOUDINARY_FOLDER` (default `keffi`), `MAX_UPLOAD_MB` (default 10)

### Frontend Variables (.env)
- `VITE_API_URL` - Backend API URL

## Database Schema

Collections and indexes are auto-created on first run (see `server/models/`):
- `admins` - Administrator accounts
- `flats` - Apartment inventory
- `reservations` - Guest bookings

Notes on the MongoDB data model:
- `_id` holds the application-generated string ids (`res-<uuid>`, `flat-1`, `manager-001`)
- Dates are stored as `YYYY-MM-DD` and times as `HH:MM` strings, which sort chronologically
- `reservations.flat` references `flats.name`; there is no foreign key, so
  `storage.assertFlatExists()` validates it and `storage.updateFlat()` cascades renames

## Important Notes

- Uploads go straight to Cloudinary; `server/uploads/` is no longer used or served
- MongoDB stores the Cloudinary `secure_url` plus `publicId`/`resourceType` for cleanup
- System auto-seeds initial flats and the manager accounts in `server/data/seedData.js` on first run
- All seeded managers can log in; `/auth/me` and `/auth/settings` act on the JWT holder
- Data reset available via `POST /api/stats/reset` endpoint
- JWT tokens expire after 8 hours (configurable)
- Rate limiting on login: 8 attempts per 15 minutes

## 60-Day Reset Implementation

The system includes a built-in data reset function:
- Backend endpoint: `POST /api/stats/reset`
- Frontend API function: `api.resetData(token)`
- Deletes all data and reseeds fresh flats and admin
- Requires admin authentication
