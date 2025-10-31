import { Alert, Button } from 'antd';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { createPaymentIntentApi } from 'services/endPoints/checkout/checkoutEndpoints';
import { getToken } from 'utils/localStorage';
import { createOrderApi } from 'services/endPoints/orders/ordersEndpoints';
import { useAppSelector, useAppDispatch } from 'redux/store';
import { fetchMyCart } from 'redux/slice/carts/cartsSlice';

import { IAddress } from 'types/user/userType';

interface IDeliveryAddress extends IAddress {
  addressType?: 'primary' | 'secondary';
}

type Props = {
  onSuccess: () => void;
  deliveryAddress?: IDeliveryAddress | null;
};

export const StripeCheckoutForm = ({ onSuccess, deliveryAddress }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const carts = useAppSelector((s) => s.carts);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!carts.totalPrice || carts.totalPrice <= 0) {
        console.warn('Cart total is 0 or empty. Cannot create payment intent.');
        return;
      }
      try {
        const token = getToken() || '';
        const amount = Math.round((carts.totalPrice || 0) * 100);
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
  }, [carts.totalPrice]);

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
      await createOrderApi(token, {
        paymentIntentId: paymentIntent?.id,
        amount: paymentIntent?.amount,
        currency: paymentIntent?.currency,
        deliveryAddress: deliveryAddress || undefined,
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
      <Button type="primary" onClick={handlePay} disabled={!stripe || !clientSecret} loading={loading}>
        Pay Now
      </Button>
    </div>
  );
};
