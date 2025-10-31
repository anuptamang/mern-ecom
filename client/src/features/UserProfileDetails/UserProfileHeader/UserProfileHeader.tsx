import { ProfileHeader } from 'components';
import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';

export const UserProfileHeader = () => {
  const { result } = useAppSelector(authSelector);
  const onProfilePhotoChange = (photoUrl: string) => {
    //
  };

  return (
    <ProfileHeader
      onProfilePhotoChange={onProfilePhotoChange}
      fullName={result?.fullName || ''}
      profilePhotoUrl={''}
    />
  );
};
