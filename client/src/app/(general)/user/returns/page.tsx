'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import ReturnsDashboard from '@/pages/private/Returns/Dashboard';

export default function UserReturns() {
  return (
    <BuyerOnlyRoute>
      <ReturnsDashboard />
    </BuyerOnlyRoute>
  );
}
