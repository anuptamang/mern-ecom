'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import WishlistDashboard from '@/pages/private/Wishlist/Dashboard';

export default function UserWishlist() {
  return (
    <BuyerOnlyRoute>
      <WishlistDashboard />
    </BuyerOnlyRoute>
  );
}
