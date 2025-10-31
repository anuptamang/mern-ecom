import { Card, List, Tag, Spin, Empty, message } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { listMyOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { getToken } from 'utils/localStorage';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './OrdersDashboard.scss';

type TProps = {};

const OrdersDashboard = (props: TProps) => {
  const title = usePageTitle();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSeller) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await listMyOrdersApi(token);
        setOrders(data.orders || []);
      } catch (e: any) {
        message.error(e?.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isSeller]);

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      paid: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Paid',
      },
      created: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
      },
      failed: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Failed',
      },
    };

    const config = statusConfig[status] || {
      color: 'default',
      icon: null,
      text: status,
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isSeller) {
    return (
      <>
        {title}
        <Container className="py-6">
          <Card title="My Orders">
            <div className="text-center py-8">
              <p className="text-gray-500">Sellers cannot view orders. This page is for buyers only.</p>
            </div>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      {title}
      <Container className="py-6">
        <Card title="My Orders" className="orders-dashboard">
          <Spin spinning={loading}>
            {orders.length === 0 && !loading ? (
              <Empty
                description="No orders yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <p className="text-gray-500">
                  Start shopping to see your orders here
                </p>
              </Empty>
            ) : (
              <List
                dataSource={orders}
                renderItem={(order: any) => (
                  <List.Item className="order-item">
                    <Card className="order-card" style={{ width: '100%' }}>
                      <div className="order-header">
                        <div className="order-info">
                          <div className="order-id">
                            Order ID: <strong>{order._id}</strong>
                          </div>
                          <div className="order-date">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="order-status-section">
                          {getStatusTag(order.status)}
                          <div className="order-amount">
                            ${((order.amount || 0) / 100).toFixed(2)} {order.currency?.toUpperCase() || 'USD'}
                          </div>
                        </div>
                      </div>

                      <div className="order-items">
                        <h4 className="order-items-title">Items:</h4>
                        <List
                          size="small"
                          dataSource={order.items || []}
                          renderItem={(item: any) => (
                            <List.Item>
                              <div className="order-item-detail">
                                {item.thumbnail && (
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="order-item-thumbnail"
                                  />
                                )}
                                <div className="order-item-info">
                                  <div className="order-item-title">{item.title}</div>
                                  <div className="order-item-meta">
                                    ${item.price} × {item.quantity}
                                  </div>
                                </div>
                                <div className="order-item-total">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>

                      {order.paymentIntentId && (
                        <div className="order-payment-info">
                          <small className="text-gray-500">
                            Payment ID: {order.paymentIntentId}
                          </small>
                        </div>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>
      </Container>
    </>
  );
};

export { OrdersDashboard };
