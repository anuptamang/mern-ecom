# Enterprise E-Commerce Platform

> A production-ready, scalable MERN stack e-commerce platform designed as a template for future projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Features

- **Full-featured E-commerce**: Products, cart, orders, payments, returns
- **User Management**: Multi-role system (buyer, seller, admin, delivery, support, finance)
- **Order Management**: Complete order lifecycle with delivery tracking
- **Payment Integration**: Stripe payment gateway
- **Return & Refund**: Comprehensive return workflow
- **Admin Dashboard**: Full admin control panel
- **Responsive Design**: Mobile-first, responsive UI

### Enterprise Features

- **Scalable Architecture**: Microservices-ready structure
- **Type Safety**: TypeScript throughout frontend
- **Error Handling**: Centralized error management
- **Logging**: Structured logging system
- **Security**: JWT auth, input validation, CORS
- **Performance**: Optimized queries, caching ready
- **Docker Support**: Containerized deployment
- **CI/CD Ready**: GitHub Actions/CircleCI configuration

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Install dependencies**

   ```bash
   # Root dependencies
   npm install

   # Client dependencies
   cd client && npm install

   # Server dependencies
   cd ../server && npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**

   ```bash
   # From root directory
   npm run dev
   ```

   Or separately:

   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm start
   ```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:

- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3010

### Using Dockerfile

```bash
# Build image
docker build -t ecommerce-app .

# Run container
docker run -p 3010:3010 --env-file .env ecommerce-app
```

## 📁 Project Structure

```
ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client layer
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # State management
│   │   ├── routes/         # Route configuration
│   │   ├── services/       # Business logic services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── constants/       # Centralized constants
│   │   └── configs/         # Configuration files
│   └── public/             # Static assets
│
├── server/                 # Node.js backend
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/         # Express middlewares
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── validators/          # Input validation
│   └── config/              # Server configuration
│
├── docs/                    # Documentation
├── scripts/                  # Build/deployment scripts
└── docker-compose.yml       # Docker compose configuration
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
NODE_ENV=development
PORT=3010
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

Update `client/src/configs/api/api.ts` for API endpoints.

## 🧪 Testing

```bash
# Client tests
cd client && npm test

# Server tests
cd server && npm test

# Run all tests
npm test
```

## 📚 Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - System architecture and design decisions
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines
- [Template Guide](./PROJECT_TEMPLATE.md) - Using this as a template

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- Rate limiting (ready)
- SQL injection protection (MongoDB)
- XSS protection (React)

## 🚀 Deployment

### Production Checklist

- [ ] Update environment variables
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Review security headers

### Deployment Options

1. **Docker**: Use provided Dockerfile
2. **Traditional**: Deploy to VPS/cloud server
3. **PaaS**: Deploy to Heroku, Railway, etc.
4. **Cloud**: AWS, GCP, Azure

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with React, Node.js, Express, MongoDB
- UI components from Ant Design
- State management with Redux Toolkit

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ as an enterprise-grade template for future projects**
