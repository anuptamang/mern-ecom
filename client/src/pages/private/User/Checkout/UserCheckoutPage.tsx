import { Button, Card, Result } from 'antd';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { usePageTitle } from 'hooks/usePageTitle';
import { useState } from 'react';
import { useAppSelector } from 'redux/store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';

const UserCheckoutPage = () => {
  const title = usePageTitle();
  const carts = useAppSelector((s) => s.carts);
  const [paid, setPaid] = useState(false);
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

  return (
    <>
      {title}
      <Container className="py-6">
        <Card title="Checkout">
          {paid ? (
            <Result status="success" title="Payment successful" subTitle="Your order has been placed." />
          ) : (
            <div>
              <div className="mb-4 text-right">Total: ${carts.totalPrice}</div>
              <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
                <StripeCheckoutForm onSuccess={() => setPaid(true)} />
              </Elements>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
};

export { UserCheckoutPage };
