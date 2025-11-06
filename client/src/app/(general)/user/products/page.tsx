'use client';

import { SellerRoute } from '@/routes/SellerRoute/SellerRoute';
import ProductsDashboardPage from '@/pages/private/Products/Dashboard';

export default function UserProducts() {
  return (
    <SellerRoute>
      <ProductsDashboardPage />
    </SellerRoute>
  );
}
