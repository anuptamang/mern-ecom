'use client';

import { DashboardSummary } from '@/components/DashboardSummary';
import { useAuth } from '@/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import { capitalizeText, getUserName } from '@/utils';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { fetchUserProfile } from '@/redux/action/auth/authAction';
import { getToken } from '@/utils/localStorage';

/**
 * This is the component for the user's dashboard page.
 * @component page
 * @props  none
 * @returns {JSX.Element}   User Dashboard
 */

const UserDashboardPage = (): JSX.Element => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const userName = result?.fullName || (result?.email ? getUserName(result.email) : '');
  const title = usePageTitle();

  useEffect(() => {
    if (result?._id && !result?.profilePhoto) {
      dispatch(fetchUserProfile({ id: result._id }));
    }
  }, [result?._id, dispatch]);

  return (
    <>
      {title}
      <h2 className="mb-6">Dashboard</h2>
      {userName && <h3 className="mb-6">Welcome, {capitalizeText(userName)}!</h3>}
      <DashboardSummary />
    </>
  );
};

export { UserDashboardPage };
