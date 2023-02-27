import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

const UserDashboardPage = () => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      UserDashboard section
    </>
  );
};

export { UserDashboardPage };
