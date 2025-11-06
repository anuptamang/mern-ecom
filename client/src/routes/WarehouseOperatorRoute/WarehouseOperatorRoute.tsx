'use client';

import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useAuth } from '@/hooks';
import { useEffect } from 'react';

interface IProps {
  children: React.ReactNode;
}

function WarehouseOperatorRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (auth?.tokenStatus === 'not set') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    // If authenticated but not a warehouse operator, redirect to dashboard
    if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'warehouse_operator') {
      router.replace(`/${pageRoutes.userDashboard}`);
      return;
    }
  }, [auth?.tokenStatus, auth?.result?.role, router, pathname]);

  // If not authenticated or not a warehouse operator, don't render children (redirect will happen)
  if (auth?.tokenStatus === 'not set' || (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'warehouse_operator')) {
    return null;
  }

  return <>{children}</>;
}

export { WarehouseOperatorRoute };
