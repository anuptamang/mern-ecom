import {
  ProfileBody,
  ProfileCover,
  ProfileHeader,
} from 'components/UserProfile';

export const UserProfileDetails = () => {
  const onCoverPhotoChange = (photoUrl: string) => {
    //
  };

  const onProfilePhotoChange = (photoUrl: string) => {
    //
  };

  return (
    <>
      <ProfileCover onCoverPhotoChange={onCoverPhotoChange} coverPhotoUrl="" />
      <ProfileHeader
        onProfilePhotoChange={onProfilePhotoChange}
        fullName={'Full Name'}
        profilePhotoUrl={''}
      />
      <ProfileBody />
    </>
  );
};
