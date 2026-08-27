# Deployment Guide - KEFFI APARTMENT SUITES

## 🚀 Deployment Options

### Option 1: Single Server (Easiest)
Deploy both frontend and backend on the same server.

**Recommended Platforms:**
- Render (free tier available)
- Railway (free tier available)
- Fly.io
- DigitalOcean App Platform

### Option 2: Separate Frontend & Backend
Deploy frontend to a static host and backend to an API host.

**Frontend Platforms:**
- Vercel (free tier)
- Netlify (free tier)
- GitHub Pages

**Backend Platforms:**
- Render
- Railway
- Heroku (paid)
- AWS Lambda / Google Cloud Functions

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

**Backend (Production):**
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=keffi
MAX_UPLOAD_MB=10
JWT_SECRET=your_secure_random_string_32_chars_minimum
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://your-frontend-domain.com
PORT=5000
```

**Frontend (Production):**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 2. Security
- [ ] Generate secure JWT_SECRET (minimum 32 characters)
- [ ] Change the seeded manager passwords in `server/data/seedData.js`
- [ ] Use a `mongodb+srv://` (TLS) connection string
- [ ] Set correct CORS_ORIGIN
- [ ] Update manager emails to your domain

### 3. Database
- [ ] Set up production MongoDB (MongoDB Atlas recommended)
- [ ] Allow the deployment host in Atlas **Network Access**
- [ ] Test database connection
- [ ] Verify MONGODB_URI is correct

## 🛠️ Deployment Steps

### Render Deployment (Single Server)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up and create a new web service

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the root directory

3. **Configure Build**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Add all required environment variables from the checklist

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Vercel + Render (Frontend + Backend)

**Frontend (Vercel):**
1. Import your repository to Vercel
2. Set root directory to `frontend`
3. Add `VITE_API_URL` environment variable
4. Deploy

**Backend (Render):**
1. Create a new web service on Render
2. Set root directory to `backend`
3. Add all backend environment variables
4. Deploy

## 🔍 Post-Deployment Verification

1. **Test API Health:**
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try guest registration
   - Check admin login

3. **Test File Upload:**
   - Try uploading a document
   - Verify it's accessible

## 🔄 60-Day Data Reset in Production

### Automated Reset Setup

**Option 1: Cron Job (Recommended)**
```bash
# Using cron-job.org or similar service
# Call this endpoint every 60 days:
curl -X POST https://your-backend-domain.com/api/stats/reset \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option 2: Manual Reset**
- Log into admin dashboard
- Use the reset button
- Or call the API endpoint manually

**Option 3: Command-line Reset**
```bash
cd backend
npm run reset          # Clear all data and reseed
npm run reset:full     # Drop collections, rebuild indexes, reseed
```

## 📊 Monitoring & Maintenance

### Regular Tasks
- Monitor database storage (MongoDB Atlas free tier: 512MB)
- Check API logs for errors
- Verify backup procedures
- Review security settings

### Backup Strategy
- Enable MongoDB Atlas automated backups
- Export data regularly for safety
- Keep backup of environment variables

## 🔐 Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong, unique passwords** for admin account
3. **Keep dependencies updated** regularly
4. **Monitor database access** and usage
5. **Set up alerts** for suspicious activity
6. **Use HTTPS** in production (automatic on most platforms)

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify MONGODB_URI is correct
- Check that the deployment host is allowed in Atlas Network Access
- Ensure database is accessible

**CORS Errors:**
- Verify CORS_ORIGIN matches your frontend domain
- Check both frontend and backend URLs

**File Upload Failing:**
- Verify the three `CLOUDINARY_*` variables are set (a 503 means they are missing)
- Check `MAX_UPLOAD_MB` against the file being uploaded (a 413 means it is too big)
- A 400 means the file type is not allowed or its bytes do not match its type
- Uploads no longer touch the server filesystem, so disk permissions are irrelevant

**Build Errors:**
- Clear cache and redeploy
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📞 Support

For deployment issues, refer to platform-specific documentation or contact the development team.
