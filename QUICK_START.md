# Quick Start Guide

Get started with the Enterprise E-Commerce Platform in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce

# Run setup script
./scripts/setup.sh

# Or manually:
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

**Minimum required configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
```

### 3. Start Development Servers

```bash
# Start both client and server
npm run dev
```

That's it! 🎉

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3010
- **Health Check**: http://localhost:3010/health

## 🐳 Docker Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Next Steps

- Read [README.md](./README.md) for complete documentation
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- See [PROJECT_TEMPLATE.md](./PROJECT_TEMPLATE.md) for customization

## 🆘 Troubleshooting

### Port already in use

```bash
# Find process using port
lsof -i :3010

# Kill process
kill -9 <PID>
```

### Database connection error

- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify database credentials

### Module not found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
cd client && rm -rf node_modules package-lock.json && npm install
cd ../server && rm -rf node_modules package-lock.json && npm install
```

## 🎯 Common Tasks

### Seed Database

```bash
cd server && npm run seed
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
cd client && npm run build
```

### Check Health

```bash
curl http://localhost:3010/health
```

## 📖 Documentation Links

- [Architecture](./ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)

---

**Happy Coding! 🚀**
