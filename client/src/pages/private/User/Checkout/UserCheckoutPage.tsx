import { Button, Card, Result, Alert, Collapse, Divider, Checkbox, List, Image, InputNumber, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { usePageTitle } from 'hooks/usePageTitle';
import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from 'redux/store';
import { authSelector } from 'redux/slice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { fetchMyCart, updateCartItem } from 'redux/slice/carts/cartsSlice';
import { AddressSelect } from 'components/AddressSelect';
import { IAddress } from 'types/user/userType';

const { Panel } = Collapse;

interface SelectedCartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  thumbnail?: string;
}

const UserCheckoutPage = () => {
  const title = usePageTitle();
  const dispatch = useAppDispatch();
  const carts = useAppSelector((s) => s.carts);
  const { result: user } = useAppSelector(authSelector);
  const [paid, setPaid] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [selectedAddressType, setSelectedAddressType] = useState<'primary' | 'secondary'>('primary');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

  // Initialize selected items with all cart items by default
  useEffect(() => {
    if (carts.items && carts.items.length > 0) {
      const allItemIds = new Set(carts.items.map((item: any) => item.productId));
      setSelectedItems(allItemIds);
    }
  }, [carts.items]);

  // Calculate selected items details and total
  const selectedItemsData = useMemo(() => {
    if (!carts.items || selectedItems.size === 0) return { items: [], totalPrice: 0, totalQuantity: 0 };
    
    const items = carts.items
      .filter((item: any) => selectedItems.has(item.productId))
      .map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
        thumbnail: item.thumbnail,
        stock: item.stock,
      }));
    
    const totalPrice = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    
    return { items, totalPrice, totalQuantity };
  }, [carts.items, selectedItems]);

  const handleItemToggle = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemIds = new Set(carts.items.map((item: any) => item.productId));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItem({ productId, quantity })).unwrap();
      message.success('Quantity updated');
    } catch (error: any) {
      message.error(error?.payload || error?.message || 'Failed to update quantity');
      dispatch(fetchMyCart());
    }
  };

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
              <Divider>Select Items to Checkout</Divider>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <Checkbox
                    checked={selectedItems.size === carts.items.length && carts.items.length > 0}
                    indeterminate={selectedItems.size > 0 && selectedItems.size < carts.items.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    Select All ({selectedItemsData.items.length} of {carts.items?.length || 0} items)
                  </Checkbox>
                  <div className="font-semibold">
                    Selected Total: ${selectedItemsData.totalPrice.toFixed(2)}
                  </div>
                </div>
                <List
                  dataSource={carts.items}
                  renderItem={(item: any) => {
                    const isSelected = selectedItems.has(item.productId);
                    const maxStock = item.stock !== undefined ? item.stock : Infinity;
                    
                    return (
                      <List.Item
                        actions={[
                          <InputNumber
                            key="qty"
                            min={1}
                            max={maxStock}
                            value={item.quantity}
                            onChange={(value) => value && handleQuantityChange(item.productId, value)}
                            disabled={!isSelected}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleItemToggle(item.productId, e.target.checked)}
                              />
                              {item.thumbnail ? (
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  width={60}
                                  height={60}
                                  style={{ objectFit: 'cover', borderRadius: 4 }}
                                  preview={false}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: 'var(--theme-background-tertiary, #f0f0f0)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    color: 'var(--theme-text-secondary, #999)',
                                  }}
                                >
                                  No Image
                                </div>
                              )}
                            </div>
                          }
                          title={
                            <div>
                              {item.title}
                              {!isSelected && <span className="text-gray-400 ml-2">(not selected)</span>}
                            </div>
                          }
                          description={
                            <div>
                              <div>Price: ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
                              {item.stock !== undefined && (
                                <div className={item.stock <= 0 ? 'text-red-500' : 'text-gray-500'}>
                                  {item.stock <= 0 ? 'Out of Stock' : `Stock: ${item.stock} available`}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
                {selectedItems.size === 0 && (
                  <Alert
                    message="No items selected"
                    description="Please select at least one item to proceed with checkout."
                    type="warning"
                    className="mt-3"
                  />
                )}
              </div>
              <Divider>Delivery Address</Divider>
              {user && (
                <div className="mb-4">
                  <AddressSelect
                    user={user}
                    onSelect={handleAddressSelect}
                    selectedAddressType={selectedAddressType}
                  />
                  {!selectedAddress && (
                    <Alert
                      message="Please add an address in your profile settings"
                      type="warning"
                      className="mt-2"
                    />
                  )}
                </div>
              )}
              <Divider>Payment</Divider>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Selected Items:</span>
                  <span className="font-semibold">{selectedItemsData.items.length} items</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total Quantity:</span>
                  <span>{selectedItemsData.totalQuantity}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total Price:</span>
                  <span>${selectedItemsData.totalPrice.toFixed(2)}</span>
                </div>
                {selectedItemsData.totalPrice === 0 && (
                  <div className="text-sm text-red-500 mt-2">
                    {selectedItems.size === 0 ? 'Please select at least one item to checkout.' : 'Selected items total is $0.00'}
                  </div>
                )}
              </div>
              <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
                <StripeCheckoutForm
                  onSuccess={() => setPaid(true)}
                  deliveryAddress={selectedAddress ? {
                    ...selectedAddress,
                    addressType: selectedAddressType,
                  } : null}
                  selectedItems={selectedItemsData.items}
                  totalPrice={selectedItemsData.totalPrice}
                />
              </Elements>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
};

export { UserCheckoutPage };
