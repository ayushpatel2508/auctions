# Environment Variables Setup

This project uses environment variables for configuration. Follow these steps to set up your environment:

## Server Setup

1. Navigate to the `server` directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `.env` according to your setup:
   - `JWT_SECRET`: Change to a secure random string
   - `MONGODB_URI`: Update if using a different database
   - `CLIENT_URL`: Update if your client runs on a different port
   - `SESSION_SECRET`: Change to a secure random string

## Client Setup

1. Navigate to the `client` directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the values in `.env` if needed:
   - `VITE_API_BASE_URL`: Should match your server URL
   - `VITE_SOCKET_URL`: Should match your server URL

## Production Deployment

For production, make sure to:

1. **Server Environment Variables:**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Use a strong `SESSION_SECRET`
   - Set proper `MONGODB_URI` for your production database
   - Set `CLIENT_URL` to your production frontend URL

2. **Client Environment Variables:**
   - Set `VITE_NODE_ENV=production`
   - Update `VITE_API_BASE_URL` to your production API URL
   - Update `VITE_SOCKET_URL` to your production server URL

## Environment Variables Reference

### Server (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `1d` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/auction-db` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | Uses `CLIENT_URL` |
| `SESSION_SECRET` | Session signing secret | Required |

### Client (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |
| `VITE_NODE_ENV` | Environment mode | `development` |
| `VITE_APP_NAME` | Application name | `Auction Platform` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly rotate secrets in production
- Use environment-specific configurations for different deployment stages