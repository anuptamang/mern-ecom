import { ProfileHeader } from 'components';
import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';
import { getToken } from 'utils/localStorage';
import axios from 'axios';
import { AUTH_API } from 'services/servicesConstants';

export const UserProfileHeader = () => {
  const { result } = useAppSelector(authSelector);
  const onProfilePhotoChange = async (fileOrUrl: any) => {
    if (!result?._id) return;
    const token = getToken() || '';
    const form = new FormData();
    form.append('thumbnail', fileOrUrl as any);
    await axios.patch(`${AUTH_API}/${result._id}/profile-photo`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <ProfileHeader
      onProfilePhotoChange={onProfilePhotoChange}
      fullName={result?.fullName || ''}
      profilePhotoUrl={result?.profilePhoto || ''}
    />
  );
};
