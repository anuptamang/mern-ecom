import { UserProfileBody } from './UserProfileBody';
import { UserProfileCover } from './UserProfileCover';
import { UserProfileHeader } from './UserProfileHeader';

export const UserProfileDetails = () => {
  return (
    <>
      <UserProfileCover />
      <UserProfileHeader />
      <UserProfileBody />
    </>
  );
};
