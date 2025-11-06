import { Alert, Button } from 'antd';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { createPaymentIntentApi } from '@/services/endPoints/checkout/checkoutEndpoints';
import { getToken } from '@/utils/localStorage';
import { createOrderApi } from '@/services/endPoints/orders/ordersEndpoints';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { fetchMyCart } from '@/redux/slice/carts/cartsSlice';

import { IAddress } from '@/types/user/userType';

interface IDeliveryAddress extends IAddress {
  addressType?: 'primary' | 'secondary';
}

interface SelectedCartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail?: string;
}

type Props = {
  onSuccess: () => void;
  deliveryAddress?: IDeliveryAddress | null;
  selectedItems?: SelectedCartItem[];
  totalPrice?: number;
};

export const StripeCheckoutForm = ({ onSuccess, deliveryAddress, selectedItems = [], totalPrice = 0 }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const carts = useAppSelector((s) => s.carts);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Use selected items price if provided, otherwise fall back to cart total
  const checkoutPrice = totalPrice > 0 ? totalPrice : (carts.totalPrice || 0);

  useEffect(() => {
    const init = async () => {
      if (!checkoutPrice || checkoutPrice <= 0) {
        console.warn('Checkout total is 0 or empty. Cannot create payment intent.');
        return;
      }
      try {
        const token = getToken() || '';
        const amount = Math.round(checkoutPrice * 100);
        if (amount <= 0) {
          console.warn('Amount is 0. Cannot create payment intent.');
          return;
        }
        const { data } = await createPaymentIntentApi(token, { amount, currency: 'usd' });
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        setError(error?.response?.data?.message || 'Failed to initialize payment');
      }
    };
    init();
  }, [checkoutPrice]);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setError(null);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Payment element not ready');
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (error) throw error;
      const token = getToken() || '';
      // Prepare items for checkout (only selected items)
      const checkoutItems = selectedItems.length > 0
        ? selectedItems.map(item => ({
            productId: item.productId,
            title: item.title,
            thumbnail: item.thumbnail,
            price: item.price,
            quantity: item.quantity,
          }))
        : undefined; // If no selectedItems provided, backend will use all cart items
      
      await createOrderApi(token, {
        paymentIntentId: paymentIntent?.id,
        amount: paymentIntent?.amount,
        currency: paymentIntent?.currency,
        deliveryAddress: deliveryAddress || undefined,
        items: checkoutItems,
      });
      // Refresh cart after successful order (cart is cleared on backend)
      await dispatch(fetchMyCart());
      onSuccess();
    } catch (e: any) {
      setError(e?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <Alert type="error" message={error} className="mb-3" />}
      <div className="p-3 border rounded mb-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button 
        type="primary" 
        onClick={handlePay} 
        disabled={!stripe || !clientSecret || checkoutPrice <= 0 || selectedItems.length === 0} 
        loading={loading}
      >
        Pay ${checkoutPrice.toFixed(2)}
      </Button>
      {selectedItems.length === 0 && (
        <div className="text-sm text-red-500 mt-2">Please select at least one item to checkout.</div>
      )}
    </div>
  );
};
