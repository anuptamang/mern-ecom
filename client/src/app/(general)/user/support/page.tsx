'use client';

import { SupportRoute } from '@/routes/SupportRoute/SupportRoute';
import SupportDashboard from '@/pages/private/Support/Dashboard';

export default function Support() {
  return (
    <SupportRoute>
      <SupportDashboard />
    </SupportRoute>
  );
}
