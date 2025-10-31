import { ProfileCover } from 'components';
import { getToken } from 'utils/localStorage';
import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';
import axios from 'axios';
import { AUTH_API } from 'services/servicesConstants';

export const UserProfileCover = () => {
  const { result } = useAppSelector(authSelector);
  const onCoverPhotoChange = async (fileOrUrl: any) => {
    if (!result?._id) return;
    const token = getToken() || '';
    const form = new FormData();
    form.append('thumbnail', fileOrUrl as any);
    await axios.patch(`${AUTH_API}/${result._id}/cover-photo`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <ProfileCover onCoverPhotoChange={onCoverPhotoChange} coverPhotoUrl={(result as any)?.coverPhoto || ''} />
  );
};
