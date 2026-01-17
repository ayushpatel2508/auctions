# Deployment Guide

This guide covers deploying your auction platform to production.

## Frontend Deployment (Vite)

### Environment Files
The project uses different environment files for different stages:

- `.env` - Development (local)
- `.env.production` - Production (automatically used by Vite)

### Build Process
```bash
cd client
npm run build
```

Vite will automatically use `.env.production` when building for production.

### Environment Variables in .env.production
```env
VITE_API_BASE_URL=https://auctions-backend.onrender.com/api
VITE_SOCKET_URL=https://auctions-backend.onrender.com
VITE_NODE_ENV=production
```

### Deployment Platforms

#### Vercel
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Environment variables are automatically loaded from `.env.production`

#### Netlify
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Environment variables are automatically loaded from `.env.production`

## Backend Deployment

### Environment Variables for Production
Update your server `.env` file or set these on your hosting platform:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
MONGODB_URI=your_production_mongodb_uri
CLIENT_URL=https://your-frontend-domain.com
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms

#### Render
1. Connect your GitHub repository
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables in Render dashboard

#### Railway
1. Connect your GitHub repository
2. Set root directory: `server`
3. Add environment variables in Railway dashboard

## Full Stack Deployment Checklist

### Before Deployment
- [ ] Update `.env.production` with your production URLs
- [ ] Generate new JWT_SECRET and SESSION_SECRET for production
- [ ] Set up production MongoDB database
- [ ] Test locally with production environment variables

### After Deployment
- [ ] Verify frontend can connect to backend API
- [ ] Test Socket.IO connections work
- [ ] Test authentication flow
- [ ] Test auction creation and bidding
- [ ] Monitor logs for any errors

## Common Issues

### CORS Errors
Make sure your server's `CLIENT_URL` matches your frontend domain exactly.

### Socket.IO Connection Issues
Ensure `VITE_SOCKET_URL` points to your backend domain and supports WebSocket connections.

### Environment Variables Not Loading
- Frontend: Make sure variables start with `VITE_`
- Backend: Make sure `.env` file is in the server directory

## Security Notes

- Never commit production `.env` files
- Use different secrets for production
- Enable HTTPS in production
- Set up proper CORS origins
- Monitor and rotate secrets regularly