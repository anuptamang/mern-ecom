import { Button, Card, Result } from 'antd';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { usePageTitle } from 'hooks/usePageTitle';
import { useState } from 'react';
import { useAppSelector } from 'redux/store';
import { createPaymentIntentApi } from 'services/endPoints/checkout/checkoutEndpoints';
import { createOrderApi } from 'services/endPoints/orders/ordersEndpoints';
import { getToken } from 'utils/localStorage';

const UserCheckoutPage = () => {
  const title = usePageTitle();
  const carts = useAppSelector((s) => s.carts);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTestPay = async () => {
    setLoading(true);
    try {
      const token = getToken() || '';
      const amount = Math.round((carts.totalPrice || 0) * 100);
      const { data } = await createPaymentIntentApi(token, { amount, currency: 'usd' });
      // In a real flow, confirm card payment with Stripe.js using data.clientSecret
      await createOrderApi(token, { paymentIntentId: 'test_pi', amount, currency: 'usd' });
      setPaid(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title}
      <Container className="py-6">
        <Card title="Checkout">
          {paid ? (
            <Result status="success" title="Payment successful" subTitle="Your order has been placed." />
          ) : (
            <div className="text-right">
              <div className="mb-4">Total: ${carts.totalPrice}</div>
              <Button type="primary" loading={loading} onClick={handleTestPay}>
                Pay Now (Test)
              </Button>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
};

export { UserCheckoutPage };
