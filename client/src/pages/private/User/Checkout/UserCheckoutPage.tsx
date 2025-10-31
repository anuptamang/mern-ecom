import { Button, Card, Result, Alert, Collapse, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { usePageTitle } from 'hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from 'redux/store';
import { authSelector } from 'redux/slice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { AddressSelect } from 'components/AddressSelect';
import { IAddress } from 'types/user/userType';

const { Panel } = Collapse;

const UserCheckoutPage = () => {
  const title = usePageTitle();
  const dispatch = useAppDispatch();
  const carts = useAppSelector((s) => s.carts);
  const { result: user } = useAppSelector(authSelector);
  const [paid, setPaid] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [selectedAddressType, setSelectedAddressType] = useState<'primary' | 'secondary'>('primary');
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

  useEffect(() => {
    // Fetch cart when checkout page loads
    dispatch(fetchMyCart());
    // Set default address
    if (user) {
      const defaultAddress = user.primaryAddress?.street ? user.primaryAddress : user.secondaryAddress;
      const defaultType = user.primaryAddress?.street ? 'primary' : 'secondary';
      setSelectedAddress(defaultAddress || null);
      setSelectedAddressType(defaultType);
    }
  }, [dispatch, user]);

  const handleAddressSelect = (address: IAddress | null, addressType: 'primary' | 'secondary') => {
    setSelectedAddress(address);
    setSelectedAddressType(addressType);
  };

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
                    <Collapse size="small" className="mb-2" defaultActiveKey={['1']}>
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
              <div className="mb-4 text-right">
                <div className="text-lg font-semibold">Total: ${(carts.totalPrice || 0).toFixed(2)}</div>
                {carts.totalPrice === 0 && (
                  <div className="text-sm text-red-500 mt-1">Your cart is empty. Please add items to cart first.</div>
                )}
              </div>
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
