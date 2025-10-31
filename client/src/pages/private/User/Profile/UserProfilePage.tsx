import { UserProfileDetails } from 'features/UserProfileDetails';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { fetchUserProfile } from 'redux/action/auth/authAction';

/**
 * This is the component for the user's profile page.
 * @component page
 * @props  none
 * @returns {JSX.Element}   User Profile
 */

const UserProfilePage = (): JSX.Element => {
  const title = usePageTitle();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);

  useEffect(() => {
    if (result?._id) {
      dispatch(fetchUserProfile({ id: result._id }));
    }
  }, [result?._id, dispatch]);

  return (
    <>
      {title}
      <h2 className="mb-6">Profile</h2>
      <UserProfileDetails />
    </>
  );
};

export { UserProfilePage };
