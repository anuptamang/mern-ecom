'use client';

import { UserProfileDetails } from '@/features/UserProfileDetails';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { fetchUserProfile } from '@/redux/action/auth/authAction';
import { usePathname } from 'next/navigation';
import { Alert } from 'antd';
import { getProfileCompletionApi } from '@/services/endPoints/user/userListEndpoints';
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
  const pathname = usePathname();
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  // Note: location.state is not available in Next.js - use searchParams or sessionStorage if needed
  const incompleteProfile = false; // Can be set via searchParams if needed

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
      {incompleteProfile && (
        <Alert
          message="Please complete your profile"
          description="Your profile is incomplete. Please complete your profile to continue."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {profileCompletion !== null && profileCompletion < 100 && (
        <Alert
          message={`Profile Completion: ${profileCompletion}%`}
          description={
            <Progress
              percent={profileCompletion}
              status={profileCompletion < 50 ? 'exception' : 'active'}
              style={{ marginTop: 8 }}
            />
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <UserProfileDetails />
    </>
  );
};

export { UserProfilePage };
