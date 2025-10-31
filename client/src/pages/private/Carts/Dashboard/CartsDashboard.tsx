import { Button, Card, InputNumber, List, Alert, Image, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { clearCart, fetchMyCart, removeFromCart, updateCartItem } from 'redux/slice/carts/cartsSlice';
import { Link } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { authSelector } from 'redux/slice';
import { getSellerCartItemsApi } from 'services/endPoints/carts/cartsEndpoints';
import { getToken } from 'utils/localStorage';
import { useNavigate } from 'react-router-dom';

type TProps = {};

const CartsDashboard = (props: TProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
              message="No cart items"
              description="No products from your store are currently in buyers' shopping carts."
              type="info"
              showIcon
            />
          ) : (
            <List
              dataSource={sellerCartItems}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button key="view" onClick={() => navigate(`/products/${item.productId}`)}>
                      View Product
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.title} width={60} height={60} style={{ objectFit: 'cover' }} preview={false} />
                      ) : null
                    }
                    title={item.title}
                    description={
                      <div>
                        <div>Price: ${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          In cart of: <strong>{item.buyerName}</strong> ({item.buyerEmail})
                        </div>
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

  return (
    <Card title="Your Cart" extra={<Button danger onClick={() => dispatch(clearCart())}>Clear</Button>}>
      <List
        dataSource={carts.items}
        renderItem={(item: any) => (
          <List.Item
            actions={[
              <InputNumber
                key="qty"
                min={1}
                value={item.quantity}
                onChange={(value) => dispatch(updateCartItem({ productId: item.productId, quantity: Number(value) }))}
              />,
              <Button key="rm" danger onClick={() => dispatch(removeFromCart(item.productId))}>Remove</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={item.thumbnail ? <img src={item.thumbnail} alt={item.title} width={60} /> : null}
              title={item.title}
              description={`Price: $${item.price} x ${item.quantity}`}
            />
          </List.Item>
        )}
      />
      <div className="flex justify-between mt-4">
        <div>Total Items: {carts.totalCount}</div>
        <div>Total: ${carts.totalPrice}</div>
      </div>
      <div className="text-right mt-4">
        <Link to={`/${pageRoutes.user}/checkout`}>
          <Button type="primary">Proceed to Checkout</Button>
        </Link>
      </div>
    </Card>
  );
};

export { CartsDashboard };
