# Deployment Guide

This guide covers deploying the Enterprise E-Commerce Platform to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Traditional Server Deployment](#traditional-server-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Production Checklist](#production-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- npm >= 9.0.0
- Git

## Environment Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Variables:**
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secure random string for JWT signing
- `BASE_URL` - Your application URL
- `CORS_ORIGIN` - Allowed frontend origins

**Security Variables:**
- Generate strong secrets:
  ```bash
  # Generate JWT secret
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 2. Database Setup

```bash
# Create MongoDB database
# Update MONGODB_URI in .env

# Run migrations/seed (if needed)
cd server && npm run seed
```

## Docker Deployment

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Custom Configuration

1. Update `docker-compose.yml` with your settings
2. Update environment variables in `.env`
3. Build and run:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

### Health Checks

```bash
# Check backend health
curl http://localhost:3010/health

# Check MongoDB
docker exec -it ecommerce-mongodb mongosh --eval "db.adminCommand('ping')"
```

## Traditional Server Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow MongoDB installation guide for your OS
```

### 2. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd ecommerce

# Install dependencies
npm install
cd client && npm install && npm run build
cd ../server && npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your configuration
```

### 3. Process Management

**Using PM2:**

```bash
# Install PM2
npm install -g pm2

# Start server
cd server
pm2 start index.js --name ecommerce-api

# Configure PM2
pm2 startup
pm2 save
```

**Using Systemd:**

```bash
# Create service file
sudo nano /etc/systemd/system/ecommerce.service
```

Service file content:
```ini
[Unit]
Description=E-Commerce API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/ecommerce/server
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable ecommerce
sudo systemctl start ecommerce
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/ecommerce
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/ecommerce/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Platform Deployment

### Heroku

```bash
# Install Heroku CLI
# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku master
```

### Railway

1. Connect GitHub repository
2. Add MongoDB service
3. Configure environment variables
4. Deploy automatically

### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production-env

# Deploy
eb deploy
```

### Google Cloud Platform

```bash
# Install gcloud CLI
# Create project
gcloud projects create your-project-id

# Deploy
gcloud app deploy
```

## Production Checklist

### Before Deployment

- [ ] Update all environment variables
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Test in staging environment
- [ ] Optimize database indexes
- [ ] Enable rate limiting
- [ ] Configure error tracking
- [ ] Set up health checks

### Security

- [ ] Use HTTPS everywhere
- [ ] Set secure HTTP headers
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Regular security updates
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Use strong passwords
- [ ] Enable database authentication

### Performance

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Optimize images
- [ ] Enable caching
- [ ] Database query optimization
- [ ] Enable Redis caching (if applicable)
- [ ] Load balancing (if needed)

### Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Database monitoring
- [ ] Application performance monitoring
- [ ] Alert configuration

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl https://your-domain.com/health

# Database health
# Check MongoDB connection

# API endpoints
curl https://your-domain.com/api/products
```

### Logs

```bash
# PM2 logs
pm2 logs ecommerce-api

# Systemd logs
sudo journalctl -u ecommerce -f

# Docker logs
docker-compose logs -f backend
```

### Backup

```bash
# MongoDB backup
mongodump --uri="your-mongodb-uri" --out=/backup/path

# Automated backup script
# Set up cron job for regular backups
```

### Updates

```bash
# Pull latest changes
git pull origin master

# Install dependencies
npm install
cd client && npm install && npm run build

# Restart application
pm2 restart ecommerce-api
# or
sudo systemctl restart ecommerce
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :3010
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection failed**
   - Check MongoDB is running
   - Verify connection string
   - Check firewall rules

3. **Build fails**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Check for missing dependencies

## Support

For deployment issues, refer to:
- [Architecture Documentation](./ARCHITECTURE.md)
- [README](./deployment-index.md)
- GitHub Issues
