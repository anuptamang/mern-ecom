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
- **Logging**: Structured logging system with request/response tracking
- **API Documentation**: Interactive Swagger/OpenAPI documentation with JSON/YAML export
- **Metrics & Observability**: Prometheus metrics endpoint for monitoring
- **Security**: Enterprise-grade security with JWT auth, application tokens, RBAC, rate limiting, input validation, CORS, security headers
- **Performance**: Optimized queries, response compression, request timeouts, graceful shutdown
- **Request Tracking**: Unique request IDs for correlation and debugging
- **Image Handling**: Cloudflare R2 storage, Cloudflare Images optimization, responsive images, WebP/AVIF support, lazy loading
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
   # Client and server use separate .env files for independent deployment
   cp client/.env.example client/.env
   cp server/.env.example server/.env

   # Edit both files with your configuration
   # - client/.env: Frontend configuration (REACT_APP_* variables)
   # - server/.env: Backend configuration (MONGODB_URI, JWT_SECRET, etc.)
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

# Run container (using server/.env for backend)
docker run -p 3010:3010 --env-file server/.env ecommerce-app
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

**Important:** Client and server use separate `.env` files:

- `client/.env` - Frontend configuration (REACT*APP*\* variables only)
- `server/.env` - Backend configuration (all server variables)

Key environment variables (see `server/.env.example` and `client/.env.example`):

```env
NODE_ENV=development
PORT=3010
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

Update `client/src/configs/api/api.ts` for API endpoints.

## 📖 API Documentation

The API provides interactive documentation and exportable specifications:

### Interactive Documentation

- **Swagger UI**: `http://localhost:3010/api-docs/`
  - Browse all endpoints
  - Test APIs directly in the browser
  - View request/response schemas
  - Authenticate with API key and JWT token

### Exportable Specifications

- **JSON Format**: `http://localhost:3010/api-docs/swagger.json`
  - Import into Postman, Insomnia, or other API tools
- **YAML Format**: `http://localhost:3010/api-docs/swagger.yaml`
  - Alternative format for tools that prefer YAML

### Quick Start

```bash
# View interactive documentation
open http://localhost:3010/api-docs/

# Download JSON spec for Postman
curl http://localhost:3010/api-docs/swagger.json -o swagger.json
```

See [API_DOCS_URLS.md](./docs/API/API_DOCS_URLS.md) for complete documentation and [POSTMAN_IMPORT.md](./docs/API/POSTMAN_IMPORT.md) for Postman import guide.

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

Complete documentation is available in the [`docs`](./docs/README.md) folder and root-level guides.

### API Documentation

- [API Documentation URLs](./docs/API/API_DOCS_URLS.md) - All available `/api-docs/` endpoints
- [Postman Import Guide](./docs/API/POSTMAN_IMPORT.md) - Import API into Postman
- [Interactive API Docs](http://localhost:3010/api-docs/) - Swagger UI (when server is running)

### Enterprise Features

- [Enterprise Implementation Checklist](./docs/enterprise/ENTERPRISE_IMPLEMENTATION_CHECKLIST.md) - Track enterprise features
- [Implementation Guide](./docs/enterprise/IMPLEMENTATION_GUIDE.md) - Step-by-step implementation guide
- [Image Handling Analysis](./docs/enterprise/IMAGE_HANDLING_ANALYSIS.md) - Current image handling vs enterprise standards
- [Image Handling Improvements](./docs/enterprise/IMAGE_HANDLING_IMPROVEMENTS.md) - Enterprise-grade image optimization guide
- [Quick Start Enterprise](./docs/getting-started/QUICK_START_ENTERPRISE.md) - Quick start for enterprise features
- [Installation Guide](./docs/getting-started/INSTALLATION.md) - Package installation guide

### Security & Configuration

- [Security Implementation](./docs/security/SECURITY_IMPLEMENTATION.md) - Complete security setup
- [Application Token Setup](./docs/security/APPLICATION_TOKEN_SETUP.md) - Application token configuration
- [Rate Limiting](./docs/security/RATE_LIMITING.md) - Rate limiting configuration
- [Load Balancing](./docs/security/LOAD_BALANCING.md) - Load balancer configuration

### Troubleshooting

- [Troubleshooting 401 Errors](./docs/security/TROUBLESHOOTING_401.md) - Fix 401 Unauthorized errors
- [Login Redirect Fix](./docs/security/LOGIN_REDIRECT_FIX.md) - Fix login redirect loops

### Quick Links

- [Getting Started](./docs/getting-started/QUICK_START.md) - Get up and running in 5 minutes
- [Architecture Documentation](./docs/architecture/ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](./docs/API/API.md) - Complete API reference
- [Development Guide](./docs/development/DEVELOPMENT.md) - Development guidelines
- [Deployment Guide](./docs/deployment/DEPLOYMENT.md) - Deployment instructions
- [Security Guide](./docs/security/SECURITY.md) - Security best practices
- [Contributing Guide](./docs/contribution/CONTRIBUTING.md) - How to contribute
- [Template Guide](./docs/getting-started/PROJECT_TEMPLATE.md) - Using this as a template

### Documentation Index

- [Complete Documentation Index](./docs/index/INDEX.md) - Browse all documentation
- [Documentation Structure](./docs/README.md) - Documentation organization

## 🔐 Security

### Authentication & Authorization

- **Application Token (X-API-Key)** - All endpoints require application token
- **JWT-based authentication** - Secure user authentication with refresh tokens
- **Role-based access control (RBAC)** - Granular permissions per role (buyer, seller, admin, etc.)

### Protection Mechanisms

- **Input validation and sanitization** - XSS and injection attack prevention
- **Rate limiting** - Configurable limits with IPv6 support and load balancer support (Redis-ready)
- **Security headers** - Comprehensive security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS configuration** - Cross-origin resource sharing with whitelist support
- **SQL injection protection** - MongoDB parameterized queries
- **XSS protection** - React built-in + input sanitization

### Observability & Monitoring

- **Request ID tracking** - Unique correlation IDs for each request
- **Request/Response logging** - Comprehensive logging with sensitive data masking
- **Metrics endpoint** - Prometheus metrics at `/metrics` for monitoring
- **Graceful shutdown** - Clean server shutdown with connection cleanup

### Performance & Reliability

- **Response compression** - Gzip/Brotli compression for faster responses
- **Request timeout** - Configurable request timeouts to prevent hanging requests
- **Error handling** - Centralized error handling with proper HTTP status codes

See [SECURITY_IMPLEMENTATION.md](./docs/security/SECURITY_IMPLEMENTATION.md) for complete security documentation.

## 🚀 Deployment

### Production Checklist

- [ ] Update environment variables
- [ ] Set secure JWT secrets and application tokens
- [ ] Configure CORS for production domain
- [x] Enable rate limiting (✅ Implemented with IPv6 and load balancer support)
- [x] API Documentation (✅ Swagger/OpenAPI with JSON/YAML export)
- [x] Metrics & Observability (✅ Prometheus metrics endpoint)
- [x] Request Tracking (✅ Request ID correlation)
- [x] Request/Response Logging (✅ Comprehensive logging with masking)
- [x] Response Compression (✅ Gzip/Brotli compression)
- [x] Request Timeout (✅ Configurable timeouts)
- [x] Graceful Shutdown (✅ Clean shutdown handling)
- [ ] Set up SSL/TLS
- [ ] Configure database backups
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure logging aggregation (ELK/CloudWatch)
- [ ] Review security headers
- [ ] Set up load balancer (if using multiple instances)
- [ ] Configure Redis for distributed rate limiting (if using load balancer)

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
