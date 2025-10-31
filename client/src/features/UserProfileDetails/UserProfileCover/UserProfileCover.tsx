import { message, Spin } from 'antd';
import { ProfileCover } from 'components';
import { getToken } from 'utils/localStorage';
import { authSelector } from 'redux/slice';
import { useAppSelector, useAppDispatch } from 'redux/store';
import axios from 'axios';
import { AUTH_API } from 'services/servicesConstants';
import { fetchUserProfile } from 'redux/action/auth/authAction';
import { useState } from 'react';

export const UserProfileCover = () => {
  const { result } = useAppSelector(authSelector);
  const dispatch = useAppDispatch();
  const [uploading, setUploading] = useState(false);
  
  const onCoverPhotoChange = async (file: any) => {
    if (!result?._id) return;
    const token = getToken() || '';
    setUploading(true);
    try {
      const form = new FormData();
      form.append('thumbnail', file);
      await axios.patch(`${AUTH_API}/${result._id}/cover-photo`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await dispatch(fetchUserProfile({ id: result._id })).unwrap();
      message.success('Cover photo updated successfully');
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to upload cover photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Spin spinning={uploading} tip="Uploading cover photo...">
      <ProfileCover
        onCoverPhotoChange={onCoverPhotoChange}
        coverPhotoUrl={(result as any)?.coverPhoto || ''}
      />
    </Spin>
  );
};
