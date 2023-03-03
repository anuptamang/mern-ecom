import { useAuth } from 'hooks';
import { usePageTitle } from 'hooks/usePageTitle';
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
  const title = usePageTitle();

  return (
    <>
      {title}
      Welcome {userName} !
    </>
  );
};

export { UserDashboardPage };
