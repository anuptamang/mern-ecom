'use client';

import { Loading } from '@/components';
import { Suspense, ReactNode } from 'react';
import { IChildren } from '@/types';

export const Content = ({ children }: IChildren) => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </>
  );
};
