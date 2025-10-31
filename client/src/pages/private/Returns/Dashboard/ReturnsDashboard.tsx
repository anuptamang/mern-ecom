import { Card, List, Tag, Spin, Empty, message, Button, Image, Modal, Popconfirm, Input, Space, Form, Checkbox, InputNumber } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { getMyReturnsApi, cancelReturnApi, createReturnRequestApi } from 'services/endPoints/return';
import { listMyOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { getToken } from 'utils/localStorage';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, StopOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { RefundStatus } from 'components';
import './ReturnsDashboard.scss';

type TProps = {};

const ReturnsDashboard = (props: TProps) => {
  const title = usePageTitle();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { result } = useAppSelector(authSelector);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [cancelReturnModalVisible, setCancelReturnModalVisible] = useState(false);
  const [cancellingReturnId, setCancellingReturnId] = useState<string | null>(null);
  const [createReturnModalVisible, setCreateReturnModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadReturns();
    if (orderIdParam) {
      loadOrderForReturn(orderIdParam);
    }
  }, [orderIdParam]);

  const loadReturns = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await getMyReturnsApi();
      setReturns(data.returns || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderForReturn = async (orderId: string) => {
    try {
      const token = getToken();
      if (!token) return;
      const { data } = await listMyOrdersApi(token);
      const order = data.orders?.find((o: any) => o._id === orderId);
      if (order && order.deliveryStatus === 'delivered') {
        setSelectedOrder(order);
        // Initialize form with order items
        const items = order.items.map((item: any) => ({
          productId: item.productId,
          return: false,
          quantity: 0,
          reason: '',
        }));
        form.setFieldsValue({ items, reason: '' });
        setCreateReturnModalVisible(true);
      } else {
        message.warning('Order must be delivered to create a return request');
      }
    } catch (error: any) {
      message.error('Failed to load order');
    }
  };

  const handleCreateReturn = async (values: any) => {
    if (!selectedOrder) return;
    try {
      const items = values.items.filter((item: any) => item.return && item.quantity > 0).map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        reason: item.reason,
      }));
      
      if (items.length === 0) {
        message.warning('Please select at least one item to return');
        return;
      }

      await createReturnRequestApi(selectedOrder._id, items, values.reason);
      message.success('Return request created successfully');
      setCreateReturnModalVisible(false);
      form.resetFields();
      setSelectedOrder(null);
      loadReturns();
      // Clear orderId from URL
      navigate(`/${pageRoutes.userReturns}`, { replace: true });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create return request');
    }
  };

  const handleCancelReturn = async () => {
    if (!cancellingReturnId) return;
    try {
      await cancelReturnApi(cancellingReturnId);
      message.success('Return request cancelled successfully');
      setCancelReturnModalVisible(false);
      setCancellingReturnId(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to cancel return');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      pending: {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
      },
      approved: {
        color: 'processing',
        icon: <CheckCircleOutlined />,
        text: 'Approved',
      },
      rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Rejected',
      },
      processing: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Processing',
      },
      refunded: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Refunded',
      },
      completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Completed',
      },
      cancelled: {
        color: 'default',
        icon: <StopOutlined />,
        text: 'Cancelled',
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

  return (
    <>
      {title}
      <Container className="py-6">
        <Card title="Returns & Refunds" className="returns-dashboard">
          <Spin spinning={loading}>
            {returns.length === 0 && !loading ? (
              <Empty
                description="No return requests yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <p className="text-gray-500">
                  Return requests for delivered orders will appear here
                </p>
              </Empty>
            ) : (
              <List
                dataSource={returns}
                renderItem={(returnRequest: any) => (
                  <List.Item className="return-item">
                    <Card className="return-card" style={{ width: '100%' }}>
                      <div className="return-header">
                        <div className="return-info">
                          <div className="return-id">
                            Return ID: <strong>{returnRequest._id.slice(-8)}</strong>
                          </div>
                          <div className="return-date">
                            {formatDate(returnRequest.createdAt)}
                          </div>
                          {returnRequest.orderId && (
                            <div className="return-order-id">
                              Order ID: <strong>{returnRequest.orderId._id?.slice(-8) || returnRequest.orderId}</strong>
                            </div>
                          )}
                        </div>
                        <div className="return-status-section">
                          {getStatusTag(returnRequest.returnStatus)}
                          {returnRequest.refundStatus && (
                            <Tag 
                              color={returnRequest.refundStatus === 'succeeded' ? 'success' : returnRequest.refundStatus === 'failed' ? 'error' : 'warning'} 
                              style={{ marginLeft: 8 }}
                            >
                              Refund: {returnRequest.refundStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Tag>
                          )}
                          <div className="return-amount">
                            ${((returnRequest.returnAmount || 0) / 100).toFixed(2)} {returnRequest.orderId?.currency?.toUpperCase() || 'USD'}
                          </div>
                        </div>
                      </div>

                      {returnRequest.reason && (
                        <div className="return-reason" style={{ marginTop: 16 }}>
                          <strong>Reason:</strong> {returnRequest.reason}
                        </div>
                      )}

                      <div className="return-items" style={{ marginTop: 16 }}>
                        <h4 className="return-items-title">Items:</h4>
                        <List
                          size="small"
                          dataSource={returnRequest.items || []}
                          renderItem={(item: any) => (
                            <List.Item>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-sm text-gray-500">
                                    Quantity: {item.quantity} × ${item.price} = ${(item.price * item.quantity).toFixed(2)}
                                  </div>
                                  {item.reason && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      Reason: {item.reason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>

                      <div className="return-actions" style={{ marginTop: 16, marginBottom: 16 }}>
                        <Space>
                          {(returnRequest.returnStatus === 'refunded' || returnRequest.refundStatus) && (
                            <Button
                              type="default"
                              onClick={() => {
                                setSelectedReturn(returnRequest);
                                setReturnModalVisible(true);
                              }}
                            >
                              View Refund Status
                            </Button>
                          )}
                          {(returnRequest.returnStatus === 'pending' || returnRequest.returnStatus === 'approved') && (
                            <Popconfirm
                              title="Cancel Return Request"
                              description="Are you sure you want to cancel this return request?"
                              onConfirm={() => {
                                setCancellingReturnId(returnRequest._id);
                                setCancelReturnModalVisible(true);
                              }}
                              okText="Yes, Cancel"
                              cancelText="No"
                            >
                              <Button type="default" danger icon={<DeleteOutlined />}>
                                Cancel Return
                              </Button>
                            </Popconfirm>
                          )}
                        </Space>
                      </div>

                      {returnRequest.rejectionReason && (
                        <div className="return-rejection" style={{ marginTop: 16 }}>
                          <strong>Rejection Reason:</strong> {returnRequest.rejectionReason}
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
          title="Refund Status"
          open={returnModalVisible}
          onCancel={() => {
            setReturnModalVisible(false);
            setSelectedReturn(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setReturnModalVisible(false);
              setSelectedReturn(null);
            }}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedReturn && (
            <RefundStatus 
              orderId={selectedReturn.orderId?._id || selectedReturn.orderId} 
              order={selectedReturn.orderId} 
            />
          )}
        </Modal>

        <Modal
          title="Cancel Return Request"
          open={cancelReturnModalVisible}
          onOk={handleCancelReturn}
          onCancel={() => {
            setCancelReturnModalVisible(false);
            setCancellingReturnId(null);
          }}
          okText="Confirm Cancellation"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to cancel this return request?</p>
        </Modal>

        <Modal
          title="Create Return Request"
          open={createReturnModalVisible}
          onCancel={() => {
            setCreateReturnModalVisible(false);
            form.resetFields();
            setSelectedOrder(null);
            navigate(`/${pageRoutes.userReturns}`, { replace: true });
          }}
          footer={null}
          width={700}
        >
          {selectedOrder && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateReturn}
            >
              <Form.Item
                label="Return Reason"
                name="reason"
                rules={[{ required: true, message: 'Please provide a reason for return' }]}
              >
                <Input.TextArea rows={3} placeholder="Please explain why you want to return these items" />
              </Form.Item>

              <Form.Item label="Select Items to Return" required>
                <Form.List name="items" initialValue={selectedOrder.items.map((item: any) => ({
                  productId: item.productId,
                  title: item.title,
                  price: item.price,
                  maxQuantity: item.quantity,
                  return: false,
                  quantity: 0,
                  reason: '',
                }))}>
                  {(fields) => (
                    <div>
                      {fields.map((field, index) => {
                        const item = selectedOrder.items[index];
                        return (
                          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
                            <Form.Item name={[field.name, 'productId']} hidden>
                              <Input type="hidden" />
                            </Form.Item>
                            <div className="flex items-center gap-4 mb-2">
                              {item.thumbnail && (
                                <Image
                                  src={item.thumbnail}
                                  alt={item.title}
                                  width={60}
                                  height={60}
                                  style={{ objectFit: 'cover' }}
                                  preview={false}
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-500">
                                  Purchased: {item.quantity} × ${item.price}
                                </div>
                              </div>
                            </div>
                            <Form.Item
                              name={[field.name, 'return']}
                              valuePropName="checked"
                            >
                              <Checkbox>Return this item</Checkbox>
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) => 
                                prevValues.items?.[index]?.return !== currentValues.items?.[index]?.return
                              }
                            >
                              {({ getFieldValue }) => 
                                getFieldValue(['items', index, 'return']) ? (
                                  <>
                                    <Form.Item
                                      name={[field.name, 'quantity']}
                                      label="Quantity to Return"
                                      rules={[
                                        { required: true, message: 'Please enter quantity' },
                                        { type: 'number', min: 1, message: 'Minimum 1' },
                                        { type: 'number', max: item.quantity, message: `Maximum ${item.quantity}` },
                                      ]}
                                    >
                                      <InputNumber
                                        min={1}
                                        max={item.quantity}
                                        style={{ width: '100%' }}
                                        placeholder={`Max: ${item.quantity}`}
                                      />
                                    </Form.Item>
                                    <Form.Item
                                      name={[field.name, 'reason']}
                                      label="Item-specific Reason (optional)"
                                    >
                                      <Input.TextArea rows={2} placeholder="Specific reason for returning this item" />
                                    </Form.Item>
                                  </>
                                ) : null
                              }
                            </Form.Item>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Form.List>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Return Request
                  </Button>
                  <Button onClick={() => {
                    setCreateReturnModalVisible(false);
                    form.resetFields();
                    setSelectedOrder(null);
                    navigate(`/${pageRoutes.userReturns}`, { replace: true });
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </Container>
    </>
  );
};

export { ReturnsDashboard };

