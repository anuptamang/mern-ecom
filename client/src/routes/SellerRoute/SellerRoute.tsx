'use client';

import { useAuth } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { ReactElement, JSXElementConstructor, useEffect } from 'react';

interface IProps {
  children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
}

function SellerRoute({ children }: IProps) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (auth?.tokenStatus === 'not set') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    // If authenticated but not a seller, redirect to dashboard
    if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'seller') {
      router.replace(`/${pageRoutes.userDashboard}`);
      return;
    }
  }, [auth?.tokenStatus, auth?.result?.role, router, pathname]);

  // If not authenticated or not a seller, don't render children (redirect will happen)
  if (auth?.tokenStatus === 'not set' || (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'seller')) {
    return null;
  }

  return children || null;
}

export { SellerRoute };
