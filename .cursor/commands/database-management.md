# Database Management - Reset and Seed Workflow

Complete workflow for database management, reset, and seeding.

## Purpose
Manage database operations including reset, seed data, and migrations.

## Prerequisites
- MongoDB running locally or accessible
- Database connection configured in `server/.env`

## Common Operations

### 1. Reset Database with Seed Data

**One Command**:
```bash
npm run reset-and-restart
```

This command:
1. Stops dev servers (ports 3000 and 3010)
2. Resets database with seed data
3. Restarts dev servers

**Manual Steps**:
```bash
# Stop servers
npm run dev:stop

# Reset database (if script exists)
cd server
npm run reset-db

# Or manually:
# Connect to MongoDB and drop database
mongosh
use ecommerce
db.dropDatabase()

# Seed database
npm run seed

# Restart servers
cd ..
npm run dev
```

### 2. Seed Database Only

```bash
cd server
npm run seed
```

### 3. View Database

**Using MongoDB Compass**:
1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Select database: `ecommerce`

**Using MongoDB Shell**:
```bash
mongosh
use ecommerce
show collections
db.products.find().pretty()
db.users.find().pretty()
```

### 4. Backup Database

```bash
# Create backup
mongodump --db=ecommerce --out=./backups/$(date +%Y%m%d_%H%M%S)

# Or using MongoDB Compass:
# - Click "Export Collection"
# - Select collections to export
# - Choose format (JSON or CSV)
```

### 5. Restore Database

```bash
# Restore from backup
mongorestore --db=ecommerce ./backups/20240101_120000/ecommerce

# Or using MongoDB Compass:
# - Click "Import Collection"
# - Select backup file
# - Choose format (JSON or CSV)
```

### 6. Clear Specific Collection

```bash
mongosh
use ecommerce
db.products.deleteMany({})
db.users.deleteMany({})
# etc.
```

### 7. View Database Statistics

```bash
mongosh
use ecommerce
db.stats()
db.products.countDocuments()
db.users.countDocuments()
```

## Seed Data Structure

Seed data typically includes:

- **Users**: Admin, sellers, buyers with different roles
- **Products**: Sample products with images, prices, categories
- **Categories**: Product categories
- **Orders**: Sample orders (optional)

## Database Configuration

**Connection String** (`server/.env`):
```env
DATABASE_URL=mongodb://localhost:27017/ecommerce
```

**For Production**:
```env
DATABASE_URL=mongodb://username:password@host:port/database?authSource=admin
```

## Migration Workflow

### 1. Create Migration

```bash
# Create migration file
mkdir -p server/migrations
touch server/migrations/$(date +%Y%m%d_%H%M%S)_migration_name.js
```

### 2. Write Migration

```javascript
// server/migrations/20240101_120000_add_indexes.js
module.exports = {
  up: async (db) => {
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },
  down: async (db) => {
    await db.collection('products').dropIndex('slug_1');
    await db.collection('users').dropIndex('email_1');
  }
};
```

### 3. Run Migration

```bash
cd server
npm run migrate
```

## Troubleshooting

### Database Connection Failed
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check connection string in `.env`
3. Verify MongoDB port (default: 27017)
4. Check firewall settings

### Reset Fails
1. Stop all servers first: `npm run dev:stop`
2. Verify MongoDB is accessible
3. Check database name matches in connection string
4. Ensure you have permissions to drop database

### Seed Data Not Loading
1. Verify seed script exists: `server/scripts/seed.js`
2. Check seed script has correct data structure
3. Verify database connection is working
4. Check for errors in seed script

## Production Database

For production:

1. **Backup Regularly**: Set up automated backups
2. **Monitor**: Monitor database performance
3. **Indexes**: Ensure proper indexes are created
4. **Replication**: Consider replica sets for high availability
5. **Security**: Use strong authentication and encryption

## Documentation
See `docs/development/` for detailed database documentation.
