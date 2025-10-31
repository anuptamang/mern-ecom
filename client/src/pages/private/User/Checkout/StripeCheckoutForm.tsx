import { Alert, Button } from 'antd';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { createPaymentIntentApi } from 'services/endPoints/checkout/checkoutEndpoints';
import { getToken } from 'utils/localStorage';
import { createOrderApi } from 'services/endPoints/orders/ordersEndpoints';
import { useAppSelector } from 'redux/store';

type Props = {
  onSuccess: () => void;
};

export const StripeCheckoutForm = ({ onSuccess }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const carts = useAppSelector((s) => s.carts);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = getToken() || '';
      const amount = Math.round((carts.totalPrice || 0) * 100);
      const { data } = await createPaymentIntentApi(token, { amount, currency: 'usd' });
      setClientSecret(data.clientSecret);
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
      });
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
