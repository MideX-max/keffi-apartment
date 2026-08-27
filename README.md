# KEFFI APARTMENT SUITES - Guest Management System

A comprehensive guest registration and access control system for apartment suites with real-time reservation management, digital pass generation, and admin dashboard.

## 🏗️ Project Structure

```
KAS/
├── frontend/                    # React frontend (Vite)
├── backend/                     # Express.js backend (API, database, uploads)
├── package.json                 # Root scripts
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ (the Vite 8 / ESLint 10 toolchain refuses to build on older versions; a `.nvmrc` pinning Node 22 is included)
- MongoDB 6+ (local, or a cloud cluster such as MongoDB Atlas)
- A Cloudinary account (free tier is fine) for image and file storage

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Configure your database:**
Edit `backend/.env` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - from your Cloudinary dashboard
- `JWT_SECRET` - Generate a secure random string

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
- Query injection prevention via schema-typed Mongoose models

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kas
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Server, then:
# Update MONGODB_URI in server/.env
MONGODB_URI=mongodb://127.0.0.1:27017/kas
```

The database itself does not need to be created up front - MongoDB creates it on
first write.

### Option 2: MongoDB Atlas (Recommended - Free Tier)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new free (M0) cluster
3. Add a database user, and allow your deployment host under **Network Access**
4. Copy the SRV connection string from **Connect > Drivers** and append the
   database name:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/kas?retryWrites=true&w=majority
   ```
5. Update `MONGODB_URI` in `server/.env`

The system will automatically create indexes and seed initial data on first run.

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

**Option 3: Command-line Reset**
```bash
cd backend
npm run reset          # Clear all data and reseed
npm run reset:full     # Drop collections, rebuild indexes, reseed
```

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
cd backend
npm start           # Start production server
npm run dev         # Start development server with hot reload
```

### Frontend Commands
```bash
cd frontend
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
MONGODB_URI=your_production_mongodb_connection_string
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
- Use a `mongodb+srv://` (TLS) connection string for production databases
- Keep dependencies updated regularly
- Use environment-specific `CORS_ORIGIN` settings

## 📄 License

Proprietary - KEFFI APARTMENT SUITES

## 🆘 Support

For issues or questions, contact the development team.
