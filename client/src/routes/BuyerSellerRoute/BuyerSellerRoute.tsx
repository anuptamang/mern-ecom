'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect } from 'react';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows buyers, sellers, and unauthenticated users to access the route
 * Blocks delivery_agency, delivery_person, warehouse_operator, support, finance, admin, etc.
 */
function BuyerSellerRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  
  // Block delivery users, finance, support, verification, inspector, and admin from accessing products
  const blockedRoles = [
    'delivery_agency', 
    'delivery_person', 
    'warehouse_operator', 
    'finance', 
    'support', 
    'support_user', 
    'verification_team', 
    'return_inspector',
    'return_deliverer',
    'admin'
  ];
  
  // Always call hooks at the top level
  useEffect(() => {
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
      } else if (auth.result.role === 'return_deliverer') {
        router.replace('/user/return-deliverer');
      }
    }
  }, [auth?.result?.role, auth?.result?.delivererType, router, blockedRoles]);
  
  // Allow unauthenticated users (public access)
  if (auth?.tokenStatus !== 'valid') {
    return children;
  }

  // If user has blocked role, don't render children (redirect will happen)
  if (auth?.result?.role && blockedRoles.includes(auth.result.role)) {
    return null;
  }

  // Allow buyers, sellers, and unauthenticated users
  return children;
}

export { BuyerSellerRoute };
