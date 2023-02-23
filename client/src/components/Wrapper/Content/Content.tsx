import { ContentLayout, Loading } from 'components';
import { ReactElement, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

type Props = {
  children?: ReactElement;
};

export const Content = ({ children }: Props) => {
  return (
    <>
      <ContentLayout>
        <Suspense fallback={<Loading />}>
          {children ? children : <Outlet />}
        </Suspense>
      </ContentLayout>
    </>
  );
};
