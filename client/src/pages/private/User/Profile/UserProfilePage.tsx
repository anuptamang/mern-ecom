import { UserProfileDetails } from 'features/UserProfileDetails';
import { usePageTitle } from 'hooks/usePageTitle';

/**
 * This is the component for the user's profile page.
 * @component page
 * @props  none
 * @returns {JSX.Element}   User Profile
 */

const UserProfilePage = (): JSX.Element => {
  const title = usePageTitle();

  return (
    <>
      {title}
      <h2 className="mb-6">Profile</h2>
      <UserProfileDetails />
    </>
  );
};

export { UserProfilePage };
