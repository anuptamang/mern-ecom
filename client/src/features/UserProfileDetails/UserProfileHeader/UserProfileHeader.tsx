import { message, Spin } from 'antd';
import { ProfileHeader } from '@/components'
import { authSelector } from '@/redux/slice';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { getToken } from '@/utils/localStorage';
import axios from 'axios';
import { AUTH_API } from '@/services/servicesConstants';
import { fetchUserProfile } from '@/redux/action/auth/authAction';
import { useState } from 'react';

export const UserProfileHeader = () => {
  const { result } = useAppSelector(authSelector);
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);

  const onProfilePhotoChange = async (file: any) => {
    if (!result?._id) return;
    const token = getToken() || '';
    setUploading(true);
    try {
      const form = new FormData();
      form.append('thumbnail', file);
      await axios.patch(`${AUTH_API}/${result._id}/profile-photo`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await dispatch(fetchUserProfile({ id: result._id })).unwrap();
      message.success('Profile photo updated successfully');
    } catch (e: any) {
      message.error(
        e?.response?.data?.message || 'Failed to upload profile photo'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Spin spinning={uploading} tip="Uploading profile photo...">
      <ProfileHeader
        onProfilePhotoChange={onProfilePhotoChange}
        fullName={result?.fullName || ''}
        profilePhotoUrl={result?.profilePhoto || ''}
      />
    </Spin>
  );
};
