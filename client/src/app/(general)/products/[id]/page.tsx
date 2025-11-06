'use client';

import { BuyerSellerRoute } from '@/routes/BuyerSellerRoute/BuyerSellerRoute';
import SingleProductPage from '@/pages/public/Products/Single';

export default function Product({ params }: { params: { id: string } }) {
  return (
    <BuyerSellerRoute>
      <SingleProductPage productId={params.id} />
    </BuyerSellerRoute>
  );
}
