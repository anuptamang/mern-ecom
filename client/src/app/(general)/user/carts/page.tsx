'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import CartsDashboard from '@/pages/private/Carts/Dashboard';

export default function UserCarts() {
  return (
    <BuyerOnlyRoute>
      <CartsDashboard />
    </BuyerOnlyRoute>
  );
}
