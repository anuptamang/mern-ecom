import { Card, List, Tag, Spin, Empty, message, Button, Image, Modal, Popconfirm, Input } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { listMyOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { getDeliveryTrackingApi, cancelOrderApi } from 'services/endPoints/delivery';
import { getToken } from 'utils/localStorage';
import { useAppSelector, useAppDispatch } from 'redux/store';
import { authSelector } from 'redux/slice';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { DeliveryTracking } from 'components/DeliveryTracking';
import './OrdersDashboard.scss';

type TProps = {};

const OrdersDashboard = (props: TProps) => {
  const title = usePageTitle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

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

  const loadDeliveryTracking = async (orderId: string) => {
    try {
      const { data } = await getDeliveryTrackingApi(orderId);
      setDeliveryTracking(data.delivery);
      setSelectedOrder(orders.find((o) => o._id === orderId));
      setTrackingModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load delivery tracking');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    try {
      await cancelOrderApi(cancellingOrderId, cancelReason);
      message.success('Order cancelled successfully. Refund will be processed.');
      setCancelModalVisible(false);
      setCancelReason('');
      setCancellingOrderId(null);
      // Reload orders
      const token = getToken();
      if (token) {
        const { data } = await listMyOrdersApi(token);
        setOrders(data.orders || []);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to cancel order');
    }
  };

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
      cancelled: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Cancelled',
      },
      refunded: {
        color: 'warning',
        icon: <StopOutlined />,
        text: 'Refunded',
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

  const handleBuyAgain = async (item: any) => {
    try {
      await dispatch(addToCart({ productId: item.productId })).unwrap();
      message.success(`${item.title} added to cart`);
      dispatch(fetchMyCart());
    } catch (error: any) {
      message.error(error?.message || 'Failed to add item to cart');
    }
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
                          <div style={{ marginBottom: 8 }}>
                            {getStatusTag(order.status)}
                            {order.deliveryStatus && (
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                {order.deliveryStatus.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Tag>
                            )}
                          </div>
                          <div className="order-amount">
                            ${((order.amount || 0) / 100).toFixed(2)} {order.currency?.toUpperCase() || 'USD'}
                          </div>
                        </div>
                      </div>

                      <div className="order-actions" style={{ marginTop: 16, marginBottom: 16 }}>
                        <Space>
                          <Button
                            type="default"
                            onClick={() => loadDeliveryTracking(order._id)}
                          >
                            Track Delivery
                          </Button>
                          {order.status === 'paid' && order.deliveryStatus !== 'cancelled' && (
                            <Popconfirm
                              title="Cancel Order"
                              description="Are you sure you want to cancel this order? A refund will be processed."
                              onConfirm={() => {
                                setCancellingOrderId(order._id);
                                setCancelModalVisible(true);
                              }}
                              okText="Yes, Cancel"
                              cancelText="No"
                            >
                              <Button type="default" danger icon={<StopOutlined />}>
                                Cancel Order
                              </Button>
                            </Popconfirm>
                          )}
                        </Space>
                      </div>

                      <div className="order-items">
                        <h4 className="order-items-title">Items:</h4>
                        <List
                          size="small"
                          dataSource={order.items || []}
                          renderItem={(item: any) => (
                            <List.Item>
                              <Card className="order-product-card" style={{ width: '100%' }}>
                                <div className="order-item-detail">
                                  {item.thumbnail ? (
                                    <Image
                                      src={item.thumbnail}
                                      alt={item.title}
                                      className="order-item-thumbnail"
                                      width={80}
                                      height={80}
                                      preview={false}
                                    />
                                  ) : (
                                    <div className="order-item-thumbnail-placeholder">
                                      No Image
                                    </div>
                                  )}
                                  <div className="order-item-info">
                                    <div className="order-item-title">{item.title}</div>
                                    <div className="order-item-meta">
                                      ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="order-item-actions">
                                    <Button
                                      type="default"
                                      icon={<EyeOutlined />}
                                      size="small"
                                      onClick={() => navigate(`/products/${item.productId}`)}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => handleBuyAgain(item)}
                                    >
                                      Buy Again
                                    </Button>
                                  </div>
                                </div>
                              </Card>
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

        <Modal
          title="Delivery Tracking"
          open={trackingModalVisible}
          onCancel={() => {
            setTrackingModalVisible(false);
            setDeliveryTracking(null);
            setSelectedOrder(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setTrackingModalVisible(false);
              setDeliveryTracking(null);
              setSelectedOrder(null);
            }}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <DeliveryTracking delivery={deliveryTracking} order={selectedOrder} />
          )}
        </Modal>

        <Modal
          title="Cancel Order"
          open={cancelModalVisible}
          onOk={handleCancelOrder}
          onCancel={() => {
            setCancelModalVisible(false);
            setCancelReason('');
            setCancellingOrderId(null);
          }}
          okText="Confirm Cancellation"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to cancel this order? A refund will be processed to your original payment method.</p>
          <Input.TextArea
            placeholder="Optional: Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            style={{ marginTop: 16 }}
          />
        </Modal>
      </Container>
    </>
  );
};

export { OrdersDashboard };
