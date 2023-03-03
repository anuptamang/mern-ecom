import { useAuth } from 'hooks';
import { Helmet } from 'react-helmet-async';
import { getUserName } from 'utils';

/**
 * Component - User Dashboard Page
 * @component
 * @props  none
 * @returns {JSX.Element}   User Dashboard
 */

const UserDashboardPage = (): JSX.Element => {
  const auth = useAuth();
  const userName = getUserName(auth.result.email);

  return (
    <>
      <Helmet>
        <title>User Dashboard | My App</title>
      </Helmet>
      Welcome {userName}
    </>
  );
};

export { UserDashboardPage };
