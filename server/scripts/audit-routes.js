/**
 * Route Audit Script
 * 
 * Audits all routes for proper authentication and authorization setup
 * Identifies routes missing Auth middleware or RBAC checks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, '../routes');
const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

// Public endpoints that don't require authentication
const publicEndpoints = {
  'health.js': ['/health'],
  'theme.js': ['/active'],
  'banner.js': ['/', '/:id'],
  'products.js': ['/', '/tags', '/:id', '/:id/related', '/:id/comments', '/:id/ratings', '/:id/viewcount'],
  'users.js': ['/login', '/register', '/check-user', '/change-password'],
  'swagger.js': ['/api-docs', '/swagger.json', '/swagger.yaml'],
  'metrics.js': ['/metrics'],
};

// Admin-only endpoints
const adminEndpoints = {
  'banner.js': ['/', '/:id', '/reorder'],
  'theme.js': ['/history', '/update', '/reset', '/upload-logo'],
  'users.js': ['/list', '/create', '/stats'],
};

const issues = [];

console.log('🔍 Auditing routes for authentication and authorization...\n');

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file uses router.use(Auth) globally
  const hasGlobalAuth = content.includes('router.use(Auth)');
  
  // Find all route definitions
  const routeMatches = content.matchAll(/router\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g);
  
  const routes = Array.from(routeMatches).map(match => ({
    method: match[1],
    path: match[2],
    line: content.substring(0, match.index).split('\n').length
  }));
  
  routes.forEach(route => {
    const fullPath = `${route.method.toUpperCase()} ${route.path}`;
    const isPublic = publicEndpoints[file]?.includes(route.path);
    const isAdmin = adminEndpoints[file]?.includes(route.path);
    
    // Check if route has Auth middleware
    const routeLine = content.split('\n')[route.line - 1];
    const hasAuth = routeLine.includes('Auth') || hasGlobalAuth;
    const hasRequirePermission = routeLine.includes('requirePermission');
    const hasRequireAdmin = routeLine.includes('requireAdmin');
    
    // Skip public endpoints
    if (isPublic) {
      return;
    }
    
    // Check for missing authentication
    if (!hasAuth && !isPublic) {
      issues.push({
        file,
        route: fullPath,
        line: route.line,
        issue: 'Missing Auth middleware',
        severity: 'HIGH'
      });
    }
    
    // Check for missing authorization
    if (hasAuth && !hasRequirePermission && !hasRequireAdmin && !isPublic) {
      // Determine expected permission based on route
      const resource = file.replace('.js', '');
      const action = route.method === 'get' ? 'read' : 
                     route.method === 'post' ? 'create' :
                     route.method === 'put' || route.method === 'patch' ? 'update' : 'delete';
      
      issues.push({
        file,
        route: fullPath,
        line: route.line,
        issue: `Missing RBAC check - Expected: requirePermission("${resource}", "${action}")`,
        severity: 'MEDIUM'
      });
    }
    
    // Check admin endpoints
    if (isAdmin && !hasRequireAdmin) {
      issues.push({
        file,
        route: fullPath,
        line: route.line,
        issue: 'Missing requireAdmin middleware',
        severity: 'HIGH'
      });
    }
  });
});

// Print results
if (issues.length === 0) {
  console.log('✅ All routes are properly configured!\n');
} else {
  console.log(`⚠️  Found ${issues.length} issues:\n`);
  
  const byFile = {};
  issues.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.keys(byFile).forEach(file => {
    console.log(`\n📄 ${file}:`);
    byFile[file].forEach(issue => {
      console.log(`  ${issue.severity === 'HIGH' ? '🔴' : '🟡'} Line ${issue.line}: ${issue.route}`);
      console.log(`     ${issue.issue}`);
    });
  });
  
  console.log(`\n📊 Summary: ${issues.length} total issues`);
  console.log(`   🔴 High: ${issues.filter(i => i.severity === 'HIGH').length}`);
  console.log(`   🟡 Medium: ${issues.filter(i => i.severity === 'MEDIUM').length}`);
}

export default issues;
