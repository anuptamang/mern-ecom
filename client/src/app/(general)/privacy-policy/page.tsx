'use client';

import { useAuth } from '@/hooks';
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicy';
import UserPrivacyPolicyPage from '@/pages/private/User/PrivacyPolicy';

export default function PrivacyPolicy() {
  const auth = useAuth();
  const isAuthenticated = auth?.tokenStatus === 'valid' ? true : false;

  if (isAuthenticated) {
    return <UserPrivacyPolicyPage />;
  }

  return <PrivacyPolicyPage />;
}
