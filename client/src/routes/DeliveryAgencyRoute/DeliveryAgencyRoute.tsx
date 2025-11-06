'use client';

import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useAuth } from '@/hooks';
import { useEffect } from 'react';

interface IProps {
  children: React.ReactNode;
}

function DeliveryAgencyRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (auth?.tokenStatus === 'not set') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    // If authenticated but not a delivery agency, redirect to dashboard
    if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'delivery_agency') {
      router.replace(`/${pageRoutes.userDashboard}`);
      return;
    }
  }, [auth?.tokenStatus, auth?.result?.role, router, pathname]);

  // If not authenticated or not a delivery agency, don't render children (redirect will happen)
  if (auth?.tokenStatus === 'not set' || (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'delivery_agency')) {
    return null;
  }

  return <>{children}</>;
}

export { DeliveryAgencyRoute };
