'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect } from 'react';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows buyers (and sellers) to access the route
 * Blocks delivery_agency, delivery_person, warehouse_operator
 */
function BuyerOnlyRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (auth?.tokenStatus !== 'valid') {
      router.replace(`/${pageRoutes.login}`);
      return;
    }

    // Block delivery users, finance, support, verification, inspector, and admin from accessing buyer-only routes
    const blockedRoles = ['delivery_agency', 'delivery_person', 'warehouse_operator', 'finance', 'support', 'support_user', 'verification_team', 'return_inspector', 'admin'];
    if (auth?.result?.role && blockedRoles.includes(auth.result.role)) {
      // Redirect to their respective dashboard
      if (auth.result.role === 'admin') {
        router.replace('/user/admin');
      } else if (auth.result.role === 'delivery_agency') {
        router.replace('/user/delivery-agency');
      } else if (auth.result.role === 'delivery_person') {
        // Check if it's a return deliverer
        if (auth.result.delivererType === 'customer_return') {
          router.replace('/user/return-deliverer');
        } else {
          router.replace('/user/delivery-person');
        }
      } else if (auth.result.role === 'warehouse_operator') {
        router.replace('/user/warehouse-operator');
      } else if (auth.result.role === 'finance') {
        router.replace('/user/finance');
      } else if (auth.result.role === 'support' || auth.result.role === 'support_user') {
        router.replace('/user/support');
      } else if (auth.result.role === 'verification_team') {
        router.replace('/user/verification');
      } else if (auth.result.role === 'return_inspector') {
        router.replace('/user/inspector');
      }
    }
  }, [auth?.tokenStatus, auth?.result?.role, auth?.result?.delivererType, router]);

  // If not authenticated or has blocked role, don't render children (redirect will happen)
  if (auth?.tokenStatus !== 'valid' || (auth?.result?.role && ['delivery_agency', 'delivery_person', 'warehouse_operator', 'finance', 'support', 'support_user', 'verification_team', 'return_inspector', 'admin'].includes(auth.result.role))) {
    return null;
  }

  return children;
}

export { BuyerOnlyRoute };
