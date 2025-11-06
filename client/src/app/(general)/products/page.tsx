'use client';

import { BuyerSellerRoute } from '@/routes/BuyerSellerRoute/BuyerSellerRoute';
import ProductsHomePage from '@/pages/public/Products/Home';

export default function Products() {
  return (
    <BuyerSellerRoute>
      <ProductsHomePage />
    </BuyerSellerRoute>
  );
}
