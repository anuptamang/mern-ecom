/**
 * Navigation utilities for Next.js
 * Provides compatibility layer for react-router-dom hooks
 */

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to replace react-router-dom's useNavigate
 */
export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: any }) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        } else {
          router.forward();
        }
        return;
      }

      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

/**
 * Hook to replace react-router-dom's useLocation
 */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
    key: '',
  };
}

/**
 * Hook to replace react-router-dom's useParams
 * Note: This is a simplified version. For dynamic routes, use Next.js's params directly in page components.
 */
export function useParams() {
  const pathname = usePathname();
  // Extract params from pathname - this is a simplified version
  // In Next.js, params are passed directly to page components
  const params: Record<string, string> = {};

  // Extract dynamic segments from pathname
  const segments = pathname.split('/').filter(Boolean);
  segments.forEach((segment, index) => {
    // Check if segment looks like an ID (could be improved)
    if (segment.match(/^[a-f0-9]{24}$/i) || segment.match(/^\d+$/)) {
      params.id = segment;
    }
  });

  return params;
}
