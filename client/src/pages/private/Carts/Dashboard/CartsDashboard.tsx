import { Button, Card, InputNumber, List } from 'antd';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { clearCart, fetchMyCart, removeFromCart, updateCartItem } from 'redux/slice/carts/cartsSlice';
import { Link } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';

type TProps = {};

const CartsDashboard = (props: TProps) => {
  const dispatch = useAppDispatch();
  const carts = useAppSelector((s) => s.carts);

  useEffect(() => {
    dispatch(fetchMyCart());
  }, [dispatch]);

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
