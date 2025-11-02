import { UserProfileDetails } from 'features/UserProfileDetails';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { fetchUserProfile } from 'redux/action/auth/authAction';
import { useLocation } from 'react-router-dom';
import { Alert } from 'antd';
import { getProfileCompletionApi } from 'services/endPoints/user/userListEndpoints';
import { useState } from 'react';
import { Progress } from 'antd';

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
  const location = useLocation();
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const incompleteProfile = location.state?.incompleteProfile;

  useEffect(() => {
    if (result?._id) {
      dispatch(fetchUserProfile({ id: result._id }));
      loadProfileCompletion();
    }
  }, [result?._id, dispatch]);

  const loadProfileCompletion = async () => {
    try {
      setLoadingCompletion(true);
      const { data } = await getProfileCompletionApi();
      setProfileCompletion(data.completion || 0);
    } catch (error) {
      console.error('Failed to load profile completion:', error);
    } finally {
      setLoadingCompletion(false);
    }
  };

  return (
    <>
      {title}
      <h2 className="mb-6">Profile</h2>
      
      {incompleteProfile && (
        <Alert
          message="Complete Your Profile"
          description="Please complete your profile information to continue. Fill in all required fields to reach 100% completion."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}
      
      {profileCompletion !== null && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Profile Completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <Progress 
            percent={profileCompletion} 
            status={profileCompletion === 100 ? 'success' : 'active'}
            strokeColor={profileCompletion === 100 ? '#52c41a' : '#1890ff'}
          />
        </div>
      )}
      
      <UserProfileDetails />
    </>
  );
};

export { UserProfilePage };
