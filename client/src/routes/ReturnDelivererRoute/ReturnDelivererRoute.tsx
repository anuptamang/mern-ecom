'use client';

import { useAuth } from '@/hooks';
import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect } from 'react';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows delivery_person with customer_return type and admin roles
 */
function ReturnDelivererRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (auth?.tokenStatus !== 'valid') {
      router.replace(`/${pageRoutes.login}?from=${pathname}`);
      return;
    }

    // Allow admin or delivery_person with customer_return delivererType
    const userRole = auth?.result?.role;
    const delivererType = auth?.result?.delivererType;
    
    if (userRole === 'admin') {
      return;
    }
    
    if (userRole === 'delivery_person' && delivererType === 'customer_return') {
      return;
    }
    
    // Redirect unauthorized users to their dashboard
    router.replace('/user/dashboard');
  }, [auth?.tokenStatus, auth?.result?.role, auth?.result?.delivererType, router, pathname]);

  if (auth?.tokenStatus !== 'valid') {
    return null;
  }

  // Allow admin or delivery_person with customer_return delivererType
  const userRole = auth?.result?.role;
  const delivererType = auth?.result?.delivererType;
  
  if (userRole === 'admin') {
    return children;
  }
  
  if (userRole === 'delivery_person' && delivererType === 'customer_return') {
    return children;
  }
  
  return null;
}

export { ReturnDelivererRoute };
