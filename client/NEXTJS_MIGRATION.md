# Next.js App Router Migration Guide

This document outlines the migration from React (Create React App) to Next.js App Router.

## Completed Changes

### 1. Configuration Files
- ✅ `next.config.js` - Next.js configuration
- ✅ `tsconfig.json` - Updated for Next.js
- ✅ `package.json` - Updated dependencies (removed react-scripts, added Next.js)
- ✅ `.eslintrc.json` - Updated for Next.js
- ✅ `next-env.d.ts` - Next.js TypeScript definitions

### 2. App Router Structure
- ✅ `src/app/layout.tsx` - Root layout with providers
- ✅ `src/app/page.tsx` - Root page (redirects to home)
- ✅ `src/app/(general)/layout.tsx` - General layout wrapper
- ✅ `src/app/(general)/page.tsx` - Home page
- ✅ All route pages created in `src/app/(general)/` directory

### 3. Updated Components
- ✅ `src/components/Nav/Nav.tsx` - Updated to use Next.js navigation
- ✅ `src/components/Logo/Logo.tsx` - Updated to use Next.js Link
- ✅ `src/components/UI/LinkButton/LinkButton.tsx` - Updated to use Next.js router
- ✅ `src/components/UI/ScrollToTop/ScrollToTop.tsx` - Updated for Next.js
- ✅ `src/layouts/Private/PrivateLayout.tsx` - Updated for Next.js
- ✅ `src/routes/PrivateRoute/PrivateRoute.tsx` - Updated for Next.js

### 4. Utilities
- ✅ `src/utils/navigation.ts` - Navigation utilities for Next.js compatibility
- ✅ `src/configs/api/apiConfigs.ts` - Updated for Next.js environment variables
- ✅ `src/hooks/usePageTitle.tsx` - Updated for Next.js

### 5. Styling
- ✅ `src/app/globals.css` - Global styles (moved from index.css)

## Remaining Tasks

### 1. Update Components Using react-router-dom

Many components still use `react-router-dom` hooks. They need to be updated to use Next.js navigation:

**Files that need updates:**
- All files in `src/pages/` directory
- All files in `src/features/` directory
- All files in `src/components/` directory that use:
  - `useNavigate` → Replace with `useRouter` from `next/navigation`
  - `useLocation` → Replace with `usePathname` and `useSearchParams` from `next/navigation`
  - `useParams` → Use `params` prop in page components or create a context
  - `Link` from `react-router-dom` → Replace with `Link` from `next/link`
  - `Navigate` from `react-router-dom` → Replace with `redirect` from `next/navigation` or `useRouter().push()`

### 2. Update Page Components

All page components need to:
- Accept `params` and `searchParams` as props (for dynamic routes)
- Use Next.js navigation hooks instead of react-router-dom
- Be marked as `'use client'` if they use client-side features (hooks, state, etc.)

**Example:**
```tsx
// Before (React Router)
const { id } = useParams();
const navigate = useNavigate();
const location = useLocation();

// After (Next.js)
'use client';
export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  // ...
}
```

### 3. Update Dynamic Routes

For dynamic routes like `/products/[id]`, the page component receives `params` as a prop:
```tsx
export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  // ...
}
```

### 4. Update Search Params

For query parameters, use `useSearchParams`:
```tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function MyPage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get('returnId');
  // ...
}
```

### 5. Update Redirects

Replace `Navigate` component with:
```tsx
// Server Component
import { redirect } from 'next/navigation';

export default function MyPage() {
  redirect('/login');
}

// Client Component
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  router.push('/login');
}
```

### 6. Update Link Components

Replace all `Link` from `react-router-dom` with `Link` from `next/link`:
```tsx
// Before
import { Link } from 'react-router-dom';
<Link to="/products">Products</Link>

// After
import Link from 'next/link';
<Link href="/products">Products</Link>
```

### 7. Environment Variables

Update environment variable names:
- `REACT_APP_*` → `NEXT_PUBLIC_*` (for client-side access)
- Access via `process.env.NEXT_PUBLIC_*`

### 8. Update API Calls

If you're using server-side API calls, consider:
- Moving API calls to Server Components or API Routes
- Using `fetch` with proper caching in Server Components
- Creating API routes in `src/app/api/` if needed

### 9. Remove React Router Dependencies

After migration:
- Remove `react-router-dom` from dependencies
- Remove `BrowserRouter` from root layout
- Remove route guards (they're now middleware or component-level checks)

### 10. Update Imports

Update all imports to use the new path aliases:
- `@/components` instead of `components`
- `@/utils` instead of `utils`
- `@/hooks` instead of `hooks`
- etc.

### 11. Test All Routes

Test all routes to ensure:
- Navigation works correctly
- Dynamic routes work
- Search params work
- Protected routes work
- Redirects work

## Migration Steps

1. **Run the development server:**
   ```bash
   npm install
   npm run dev
   ```

2. **Update components incrementally:**
   - Start with the most critical components
   - Test after each update
   - Fix any TypeScript errors

3. **Update page components:**
   - Convert to Next.js page structure
   - Update navigation hooks
   - Test dynamic routes

4. **Remove React Router:**
   - Remove from dependencies
   - Remove unused imports
   - Clean up route guard components

5. **Final testing:**
   - Test all routes
   - Test authentication flow
   - Test protected routes
   - Test dynamic routes
   - Test search params

## Notes

- The `(general)` route group is used to share the GeneralLayout across multiple routes
- Client components must be marked with `'use client'` directive
- Server components are the default in Next.js App Router
- Use `useRouter`, `usePathname`, `useSearchParams` from `next/navigation` for client-side navigation
- Use `redirect` from `next/navigation` for server-side redirects

## Common Issues

1. **"use client" directive missing**: Add `'use client'` at the top of components using hooks or browser APIs
2. **Import errors**: Update path aliases to use `@/` prefix
3. **Navigation not working**: Ensure you're using `useRouter` from `next/navigation`, not `react-router-dom`
4. **Params not working**: Use `params` prop in page components for dynamic routes
5. **Search params not working**: Use `useSearchParams` from `next/navigation`
