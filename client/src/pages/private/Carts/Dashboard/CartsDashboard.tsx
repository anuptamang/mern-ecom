'use client';

import { Button, Card, InputNumber, List, Alert, Image, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { clearCart, fetchMyCart, removeFromCart, updateCartItem } from '@/redux/slice/carts/cartsSlice';
import Link from 'next/link';
import { pageRoutes } from '@/data/static/pageRoutes';
import { authSelector } from '@/redux/slice';
import { getSellerCartItemsApi } from '@/services/endPoints/carts/cartsEndpoints';
import { getToken } from '@/utils/localStorage';
import { useRouter } from 'next/navigation';

type TProps = {};

const CartsDashboard = (props: TProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const carts = useAppSelector((s) => s.carts);
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const [sellerCartItems, setSellerCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSeller) {
      loadSellerCartItems();
    } else {
      dispatch(fetchMyCart());
    }
  }, [dispatch, isSeller]);

  const loadSellerCartItems = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await getSellerCartItemsApi(token);
      setSellerCartItems(data.cartItems || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  if (isSeller) {
    return (
      <Card title="Products in Buyer Carts">
        <Spin spinning={loading}>
          {sellerCartItems.length === 0 ? (
            <Alert
              message="No items found"
              description="No products are currently in any buyer's cart."
              type="info"
            />
          ) : (
            <List
              dataSource={sellerCartItems}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={item.product?.images?.[0] || ''}
                        alt={item.product?.title}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    }
                    title={item.product?.title}
                    description={
                      <div>
                        <div>Price: ${item.product?.price}</div>
                        <div>In {item.cartCount} cart(s)</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    );
  }

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart({ productId }));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(productId);
      return;
    }
    dispatch(updateCartItem({ productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    router.push(`/${pageRoutes.checkout}`);
  };

  return (
    <Card
      title="Shopping Cart"
      extra={
        carts.items.length > 0 && (
          <Button onClick={handleClearCart} danger>
            Clear Cart
          </Button>
        )
      }
    >
      {carts.items.length === 0 ? (
        <Alert
          message="Your cart is empty"
          description={
            <div>
              <p>Add some products to your cart to continue shopping.</p>
              <Link href={`/${pageRoutes.products}`}>
                <Button type="primary" style={{ marginTop: 16 }}>
                  Browse Products
                </Button>
              </Link>
            </div>
          }
          type="info"
        />
      ) : (
        <>
          <List
            dataSource={carts.items}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    danger
                    onClick={() => handleRemove(item.productId)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      src={item.product?.images?.[0] || ''}
                      alt={item.product?.title}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  }
                  title={
                    <Link href={`/${pageRoutes.products}/${item.productId}`}>
                      {item.product?.title}
                    </Link>
                  }
                  description={
                    <div>
                      <div>Price: ${item.product?.price}</div>
                      <div>
                        Quantity:{' '}
                        <InputNumber
                          min={1}
                          max={item.product?.stock || 1}
                          value={item.quantity}
                          onChange={(value) =>
                            handleUpdateQuantity(item.productId, value || 1)
                          }
                        />
                      </div>
                      <div>
                        Subtotal: ${(item.product?.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              <strong>Total: ${carts.totalPrice.toFixed(2)}</strong>
            </div>
            <Button type="primary" size="large" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export { CartsDashboard };
