'use client';

import { FinanceRoute } from '@/routes/FinanceRoute/FinanceRoute';
import FinanceDashboard from '@/pages/private/Finance/Dashboard';

export default function Finance() {
  return (
    <FinanceRoute>
      <FinanceDashboard />
    </FinanceRoute>
  );
}
