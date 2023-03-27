import { ProfileHeader } from 'components';

export const UserProfileHeader = () => {
  const onProfilePhotoChange = (photoUrl: string) => {
    //
  };

  return (
    <ProfileHeader
      onProfilePhotoChange={onProfilePhotoChange}
      fullName={'Full Name'}
      profilePhotoUrl={''}
    />
  );
};
