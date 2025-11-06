'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import UserCheckoutPage from '@/pages/private/User/Checkout';

export default function UserCheckout() {
  return (
    <BuyerOnlyRoute>
      <UserCheckoutPage />
    </BuyerOnlyRoute>
  );
}
