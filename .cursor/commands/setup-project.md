# Setup Project - Initial Setup Workflow

Complete initial setup workflow for new developers or fresh installations.

## Purpose

Set up the entire project from scratch, including dependencies, environment configuration, and database setup.

## Steps

1. **Clone and Navigate**

   ```bash
   git clone <repository-url>
   cd mern-ecom
   ```

2. **Install Dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..

   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Configure Environment Variables**

   ```bash
   # Copy example files
   cp client/.env.example client/.env
   cp server/.env.example server/.env

   # Edit with your configuration
   # Client: Set REACT_APP_BACKEND_API_URL and REACT_APP_APPLICATION_TOKEN
   # Server: Set DATABASE_URL, JWT_SECRET, APPLICATION_TOKEN, etc.
   ```

4. **Setup Database**

   ```bash
   # Start MongoDB (if not running)
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   # Windows: net start MongoDB

   # Reset database with seed data
   npm run reset-and-restart
   ```

5. **Verify Setup**

   ```bash
   # Start development servers
   npm run dev

   # Verify:
   # - Frontend: http://localhost:3000
   # - Backend: http://localhost:3010
   # - Health: http://localhost:3010/api/v1/health
   ```

## Required Environment Variables

### Client (.env)

- `REACT_APP_BACKEND_API_URL=http://localhost:3010/api/v1`
- `REACT_APP_APPLICATION_TOKEN=your_application_token`

### Server (.env)

- `DATABASE_URL=mongodb://localhost:27017/ecommerce`
- `JWT_SECRET=your_jwt_secret`
- `APPLICATION_TOKEN=your_application_token`
- `PORT=3010`

## Next Steps

- [ ] Configure Cloudflare (see `setup-cloudflare.md`)
- [ ] Setup monitoring (see `setup-monitoring.md`)
- [ ] Review API documentation (see `setup-api-docs.md`)
