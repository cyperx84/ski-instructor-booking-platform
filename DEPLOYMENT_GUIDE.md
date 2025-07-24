# Deployment Guide

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Prerequisites
- Node.js 18.0.0+
- PostgreSQL 13.0+
- Redis (optional, for caching)

### Steps

1. **Install Dependencies**
   ```bash
   npm ci --only=production
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-super-secret-key
   export DB_HOST=your-db-host
   export DB_PASSWORD=your-db-password
   # Set other required variables
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ski-instructor-api .
docker run -p 3000:3000 ski-instructor-api
```

### Environment Variables

Required for production:
- `NODE_ENV=production`
- `JWT_SECRET` (strong random string)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `CORS_ORIGIN` (your frontend URL)

### Health Checks

The API provides health check endpoints:
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Database Migration

When implementing database migrations, run:
```bash
npm run migrate
```

### Monitoring

Consider implementing:
- Application monitoring (e.g., New Relic, DataDog)
- Log aggregation (e.g., ELK stack)
- Error tracking (e.g., Sentry)
- Performance monitoring

### Security Checklist

- [ ] Strong JWT secret
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] Logging configured
- [ ] Error handling implemented