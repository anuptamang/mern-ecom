'use client';

import { VerificationRoute } from '@/routes/VerificationRoute/VerificationRoute';
import VerificationTeamDashboard from '@/pages/private/VerificationTeam/Dashboard';

export default function Verification() {
  return (
    <VerificationRoute>
      <VerificationTeamDashboard />
    </VerificationRoute>
  );
}
