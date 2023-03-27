import { ProfileCover } from 'components';

export const UserProfileCover = () => {
  const onCoverPhotoChange = (photoUrl: string) => {
    //
  };

  return (
    <ProfileCover onCoverPhotoChange={onCoverPhotoChange} coverPhotoUrl="" />
  );
};
