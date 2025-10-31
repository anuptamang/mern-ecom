import { Button, Card, Result, Alert, Collapse } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { usePageTitle } from 'hooks/usePageTitle';
import { useState } from 'react';
import { useAppSelector } from 'redux/store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';

const { Panel } = Collapse;

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
              <Alert
                message="Testing Purpose Only"
                description={
                  <div>
                    <p className="mb-2">Use these Stripe test cards. Any future expiry date and any CVC (e.g., 123) will work.</p>
                    <Collapse size="small" className="mb-2">
                      <Panel header="Test Card Information" key="1">
                        <div className="space-y-2">
                          <div>
                            <strong>Success:</strong> 4242 4242 4242 4242
                          </div>
                          <div>
                            <strong>3D Secure required:</strong> 4000 0027 6000 3184
                          </div>
                          <div>
                            <strong>Declined (insufficient funds):</strong> 4000 0000 0000 9995
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          More test cards: <a href="https://stripe.com/docs/testing" target="_blank" rel="noopener noreferrer">https://stripe.com/docs/testing</a>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                }
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                className="mb-4"
              />
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
