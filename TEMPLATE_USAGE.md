# Template Usage Guide

Step-by-step guide to customize this template for your project.

## 🎯 Step 1: Clone & Rename

```bash
git clone <this-repo> my-new-project
cd my-new-project
```

## 🔄 Step 2: Update Project Identity

### Update Package Names

1. **Root package.json**:
   ```json
   {
     "name": "my-new-project",
     "description": "Your project description"
   }
   ```

2. **client/package.json**:
   ```json
   {
     "name": "my-new-project-client"
   }
   ```

3. **server/package.json**:
   ```json
   {
     "name": "my-new-project-server"
   }
   ```

### Update Branding

1. **Logo**: Replace `client/public/logo*.png`
2. **Favicon**: Replace `client/public/favicon.ico`
3. **Colors**: Update theme in `client/src/assets/styles/antd/theme.ts`
4. **Site Name**: Update in:
   - `client/src/data/static/siteData.json`
   - `client/public/index.html`

### Update Metadata

1. **client/public/index.html**:
   - Update title
   - Update meta tags
   - Update description

2. **README.md**:
   - Update project name
   - Update description
   - Update repository URLs

## ⚙️ Step 3: Configure Environment

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Update these
NODE_ENV=development
BASE_URL=http://localhost:3010
MONGODB_URI=mongodb://localhost:27017/my-new-project
JWT_SECRET=your-secure-random-secret-here
CORS_ORIGIN=http://localhost:3000

# Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗂️ Step 4: Customize Features

### Enable/Disable Features

1. **Payment**: Remove/modify Stripe integration if not needed
2. **Chat**: Remove socket.io if chat not needed
3. **Returns**: Simplify return workflow if not needed
4. **Multi-role**: Simplify roles if not needed

### Update Models

Modify `server/models/` to match your domain:

```javascript
// Example: Customize User model
const userSchema = new mongoose.Schema({
  // Your custom fields
});
```

### Update Components

1. **Remove unused components**
2. **Customize existing components**
3. **Add your custom components**

## 🎨 Step 5: Styling & Theme

1. **Update Colors**:
   - `client/src/assets/styles/antd/theme.ts`
   - `client/src/assets/styles/_variables.scss`

2. **Update Typography**:
   - Font families
   - Font sizes
   - Font weights

3. **Customize Components**:
   - Update component styles
   - Modify Ant Design theme

## 📝 Step 6: Documentation

1. **Update README.md**:
   - Project name
   - Description
   - Features list
   - Installation instructions

2. **Update License**:
   - Change copyright if needed
   - Update year

3. **Remove Template-Specific Docs**:
   - Keep what's relevant
   - Remove PROJECT_TEMPLATE.md if not needed

## 🔧 Step 7: Dependencies

### Review Dependencies

1. **Remove Unused**:
   ```bash
   # Client
   cd client
   npm uninstall <unused-package>

   # Server
   cd server
   npm uninstall <unused-package>
   ```

2. **Add Required**:
   ```bash
   npm install <required-package>
   ```

## 🗑️ Step 8: Clean Up

### Remove Template-Specific Files

- `TEMPLATE_USAGE.md` (this file, if you don't need it)
- `ENTERPRISE_SUMMARY.md` (if not needed)
- Template examples in code

### Update .gitignore

Add project-specific ignores:

```gitignore
# Your project-specific ignores
*.your-custom-extension
your-custom-directory/
```

## ✅ Step 9: Initial Setup

```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Run setup script
./scripts/setup.sh

# Seed database (if applicable)
cd server && npm run seed

# Start development
npm run dev
```

## 🧪 Step 10: Testing

1. **Test Core Features**:
   - User registration/login
   - Main functionality
   - API endpoints
   - Database operations

2. **Update Tests**:
   - Modify test cases
   - Add your tests
   - Update test data

## 🚀 Step 11: First Commit

```bash
# Initialize git (if new repo)
git init

# Update .git remote
git remote set-url origin <your-repo-url>

# First commit
git add .
git commit -m "Initial commit: Customized from Enterprise E-Commerce Template"
git push -u origin master
```

## 📋 Customization Checklist

- [ ] Project name updated everywhere
- [ ] Package.json files updated
- [ ] Logo and favicon replaced
- [ ] Colors and theme customized
- [ ] Environment variables configured
- [ ] Unused features removed
- [ ] Models customized
- [ ] Components customized
- [ ] Documentation updated
- [ ] Dependencies reviewed
- [ ] Tests updated
- [ ] Git repository configured

## 🎓 Learning from Template

Study these areas to understand the architecture:

1. **Configuration Management**: `server/config/index.js`
2. **Error Handling**: `server/utils/errorHandler.js`
3. **API Client**: `client/src/utils/apiClient.ts`
4. **State Management**: `client/src/redux/`
5. **Component Structure**: `client/src/components/`
6. **Constants**: `client/src/constants/`

## 💡 Tips

1. **Don't Remove Everything**: Keep enterprise utilities (logging, error handling, etc.)
2. **Gradual Customization**: Customize incrementally, test as you go
3. **Keep Documentation**: Update docs as you customize
4. **Version Control**: Commit changes regularly
5. **Test Thoroughly**: Test after each major change

## 📚 Resources

- [Architecture Guide](./ARCHITECTURE.md) - Understand the system
- [Development Guide](./docs/DEVELOPMENT.md) - Development practices
- [API Documentation](./docs/API.md) - API reference
- [Deployment Guide](./DEPLOYMENT.md) - Deployment options

---

**Ready to build your project! 🚀**
