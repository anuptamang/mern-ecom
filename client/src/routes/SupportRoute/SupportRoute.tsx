'use client';

import { useAuth } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect } from 'react';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows support and admin roles
 */
function SupportRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (auth?.tokenStatus !== 'valid') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    const allowedRoles = ['support', 'admin', 'support_user'];
    if (auth?.result?.role && !allowedRoles.includes(auth.result.role)) {
      router.replace('/user/dashboard');
      return;
    }
  }, [auth?.tokenStatus, auth?.result?.role, router, pathname]);

  if (auth?.tokenStatus !== 'valid') {
    return null;
  }

  const allowedRoles = ['support', 'admin', 'support_user'];
  if (auth?.result?.role && !allowedRoles.includes(auth.result.role)) {
    return null;
  }

  return children;
}

export { SupportRoute };
