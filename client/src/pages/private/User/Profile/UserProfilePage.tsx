import { useAuth } from 'hooks';
import { usePageTitle } from 'hooks/usePageTitle';
import { getUserName } from 'utils';

/**
 * Component - User Profile Page
 * @component
 * @props  none
 * @returns {JSX.Element}   User Profile
 */

const UserProfilePage = (): JSX.Element => {
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

export { UserProfilePage };
