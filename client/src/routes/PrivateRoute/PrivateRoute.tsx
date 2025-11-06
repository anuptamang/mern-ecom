'use client';

import { useAuth } from '@/hooks';
import { PrivateLayout } from '@/layouts';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  redirect?: string;
}

function PrivateRoute({ children, redirect = '/login' }: Props) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth?.tokenStatus === 'not set') {
      router.push(redirect);
    }
  }, [auth?.tokenStatus, router, redirect]);

  if (auth?.tokenStatus === 'not set') {
    return null; // Or a loading spinner
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}

export { PrivateRoute };
