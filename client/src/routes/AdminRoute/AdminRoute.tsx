'use client';

import { useAuth } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect } from 'react';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows admin role
 */
function AdminRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (auth?.tokenStatus !== 'valid') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    if (auth?.result?.role !== 'admin') {
      router.replace('/user/dashboard');
      return;
    }
  }, [auth?.tokenStatus, auth?.result?.role, router, pathname]);

  if (auth?.tokenStatus !== 'valid' || auth?.result?.role !== 'admin') {
    return null;
  }

  return children;
}

export { AdminRoute };
