'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import OrdersDashboard from '@/pages/private/Orders/Dashboard';

export default function UserOrders() {
  return (
    <BuyerOnlyRoute>
      <OrdersDashboard />
    </BuyerOnlyRoute>
  );
}
