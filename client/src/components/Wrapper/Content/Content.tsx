import { Loading } from 'components';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { IChildren } from 'types';

export const Content = ({ children }: IChildren) => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        {children ? children : <Outlet />}
      </Suspense>
    </>
  );
};
