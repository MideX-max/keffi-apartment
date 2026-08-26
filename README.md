# KEFFI APARTMENT SUITES - Guest Management System

A comprehensive guest registration and access control system for apartment suites with real-time reservation management, digital pass generation, and admin dashboard.

## 🏗️ Project Structure

```
KAS/
├── keffi-apartment-suites/     # React frontend (Vite)
├── server/                      # Express.js backend
├── package.json                 # Root scripts
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ (the Vite 8 / ESLint 10 toolchain refuses to build on older versions; a `.nvmrc` pinning Node 22 is included)
- PostgreSQL (local or cloud like Supabase)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Copy example env files
cp server/.env.example server/.env
cp keffi-apartment-suites/.env.example keffi-apartment-suites/.env
```

3. **Configure your database:**
Edit `server/.env` and update:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate a secure random string
- `ADMIN_BOOTSTRAP_PASSWORD` - Your initial admin password

4. **Start the application:**
```bash
# Development (both frontend and backend)
npm run dev:all

# Or individually:
npm run dev      # Frontend only
npm run server   # Backend only
```

5. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 📱 Features

### Guest Features
- Online registration with document upload
- Digital signature capture
- Real-time pass generation (PDF)
- Status checking via pass ID
- Mobile-responsive design

### Admin Features
- Reservation management (approve/reject)
- Real-time dashboard with statistics
- Flat availability tracking
- Conflict detection and prevention
- Settings management
- Data reset functionality (60-day cycle)

### Security Features
- JWT authentication
- Rate limiting on login
- CORS protection
- Security headers
- Password hashing with bcrypt
- SQL injection prevention

## 🔧 Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=true
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
ADMIN_BOOTSTRAP_PASSWORD=your_admin_password
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
PORT=5000
NODE_ENV=development
```

### Frontend (`keffi-apartment-suites/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL
# Create database
createdb kas

# Update DATABASE_URL in server/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kas
```

### Option 2: Supabase (Recommended - Free Tier)
1. Create account at https://supabase.com
2. Create new project (free tier)
3. Copy the **Session/Transaction pooler** URI from Project Settings > Database.
   Do not use the direct `db.<project-ref>.supabase.co` host: it is IPv6-only and
   unreachable from most hosting providers.
   ```
   DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```
4. Update `DATABASE_URL` in `server/.env`
5. Set `DATABASE_SSL=true`

The system will automatically create tables and seed initial data on first run.

## 🔄 60-Day Data Reset

The system includes a built-in data reset function for your 60-day cycle:

### API Endpoint
```bash
POST /api/stats/reset
```
Requires admin authentication.

### Implementation Options

**Option 1: Manual Reset**
- Use the reset button in admin dashboard
- Call the API endpoint directly

**Option 2: Automated Reset**
- Set up a cron job to call the reset endpoint every 60 days
- Use a service like cron-job.org for scheduling

**Option 3: Supabase Project Reset**
- Delete and recreate Supabase project every 60 days
- Update `DATABASE_URL` in `.env`

## 📦 Available Scripts

### Root Commands
```bash
npm run dev         # Start frontend development server
npm run dev:all     # Start both frontend and backend
npm run server      # Start backend server
npm run build       # Build frontend for production
npm start           # Start backend with frontend served
```

### Backend Commands
```bash
cd server
npm start           # Start production server
npm run dev         # Start development server with hot reload
```

### Frontend Commands
```bash
cd keffi-apartment-suites
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🚢 Deployment

### Production Deployment Checklist

1. **Set production environment variables:**
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
DATABASE_SSL=true
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=your_production_frontend_url
```

2. **Build the frontend:**
```bash
npm run build
```

3. **Start the server:**
```bash
npm start
```

The server will serve both the API and the built frontend.

### Deployment Platforms

**Backend + Frontend (Single Server):**
- Render, Railway, Fly.io
- VPS (DigitalOcean, AWS EC2)

**Frontend (Static):**
- Vercel, Netlify
- GitHub Pages

**Backend (API):**
- Render, Railway, Heroku
- AWS Lambda, Google Cloud Functions

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use strong, unique `JWT_SECRET` in production
- Enable `DATABASE_SSL` for production databases
- Keep dependencies updated regularly
- Use environment-specific `CORS_ORIGIN` settings

## 📄 License

Proprietary - KEFFI APARTMENT SUITES

## 🆘 Support

For issues or questions, contact the development team.
