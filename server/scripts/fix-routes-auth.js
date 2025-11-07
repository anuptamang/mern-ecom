/**
 * Route Authentication/Authorization Fix Script
 * 
 * This script systematically fixes missing authentication and authorization
 * in all route files. It ensures:
 * 1. All protected routes have Auth middleware
 * 2. All protected routes have RBAC checks
 * 3. Public routes are properly marked
 * 
 * Run: node server/scripts/fix-routes-auth.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '../routes');

// Define public endpoints that don't require authentication
const publicEndpoints = {
  'health.js': ['/'],
  'theme.js': ['/active'],
  'banner.js': ['/', '/:id'],
  'products.js': ['/', '/tags', '/:id', '/:id/related', '/:id/comments', '/:id/ratings', '/:id/viewcount'],
  'users.js': ['/login', '/register', '/check-user', '/change-password'],
  'swagger.js': ['/api-docs', '/swagger.json', '/swagger.yaml'],
  'metrics.js': ['/'],
};

// Define admin-only endpoints
const adminEndpoints = {
  'banner.js': ['/', '/:id', '/reorder'],
  'theme.js': ['/history', '/update', '/reset', '/upload-logo'],
  'users.js': ['/list', '/create', '/stats'],
};

console.log('🔧 Fixing routes for authentication and authorization...\n');

const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Check if file already has global Auth
  const hasGlobalAuth = content.includes('router.use(Auth)');
  
  // Find all route definitions
  const routeMatches = Array.from(content.matchAll(/router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g));
  
  routeMatches.forEach(match => {
    const method = match[1];
    const routePath = match[2];
    const fullRoute = `${method.toUpperCase()} ${routePath}`;
    
    // Skip public endpoints
    if (publicEndpoints[file]?.includes(routePath)) {
      return;
    }
    
    // Find the route definition line
    const lines = content.split('\n');
    const routeLineIndex = lines.findIndex(line => 
      line.includes(`router.${method}(`) && 
      line.includes(`"${routePath}"`) || line.includes(`'${routePath}'`) || line.includes(`\`${routePath}\``)
    );
    
    if (routeLineIndex === -1) return;
    
    const routeLine = lines[routeLineIndex];
    
    // Check if route has Auth middleware
    const hasAuth = routeLine.includes('Auth') || hasGlobalAuth;
    const hasRequirePermission = routeLine.includes('requirePermission');
    const hasRequireAdmin = routeLine.includes('requireAdmin');
    
    // Fix missing Auth
    if (!hasAuth && !hasGlobalAuth) {
      // Find the handler function name
      const handlerMatch = routeLine.match(/,\s*(\w+)\)/);
      if (handlerMatch) {
        const handlerName = handlerMatch[1];
        const newRouteLine = routeLine.replace(
          `router.${method}("${routePath}",`,
          `router.${method}("${routePath}", Auth,`
        );
        lines[routeLineIndex] = newRouteLine;
        modified = true;
        console.log(`✅ Added Auth to ${file}: ${fullRoute}`);
      }
    }
    
    // Fix missing RBAC (if Auth is present but no RBAC)
    if ((hasAuth || hasGlobalAuth) && !hasRequirePermission && !hasRequireAdmin) {
      // Determine expected permission
      const resource = file.replace('.js', '').replace('s', ''); // products -> product, users -> user
      const action = method === 'get' ? 'read' : 
                     method === 'post' ? 'create' :
                     method === 'put' || method === 'patch' ? 'update' : 'delete';
      
      // Check if it's an admin endpoint
      if (adminEndpoints[file]?.includes(routePath)) {
        const handlerMatch = routeLine.match(/,\s*(\w+)\)/);
        if (handlerMatch) {
          const handlerName = handlerMatch[1];
          const newRouteLine = routeLine.replace(
            `router.${method}("${routePath}", Auth,`,
            `router.${method}("${routePath}", Auth, requireAdmin,`
          );
          lines[routeLineIndex] = newRouteLine;
          modified = true;
          console.log(`✅ Added requireAdmin to ${file}: ${fullRoute}`);
        }
      } else {
        // Add requirePermission
        const handlerMatch = routeLine.match(/,\s*(\w+)\)/);
        if (handlerMatch) {
          const handlerName = handlerMatch[1];
          const newRouteLine = routeLine.replace(
            `router.${method}("${routePath}", Auth,`,
            `router.${method}("${routePath}", Auth, requirePermission("${resource}", "${action}"),`
          );
          lines[routeLineIndex] = newRouteLine;
          modified = true;
          console.log(`✅ Added requirePermission to ${file}: ${fullRoute}`);
        }
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`\n📝 Updated ${file}\n`);
  }
});

console.log('✅ Route fixes complete!\n');
console.log('⚠️  Please review the changes and test all endpoints.\n');
