import { Card, List, Tag, Spin, Empty, message, Button, Image, Modal, Popconfirm, Input, Space, Form, Checkbox, InputNumber, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined as DeleteIcon } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { getMyReturnsApi, cancelReturnApi, createReturnRequestApi } from 'services/endPoints/return';
import { listMyOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { BACKEND_API } from 'configs/api';
import { getToken } from 'utils/localStorage';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, StopOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import './ReturnsDashboard.scss';

const { Text } = Typography;

type TProps = {};

const ReturnsDashboard = (props: TProps) => {
  const title = usePageTitle();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const orderItemIdParam = searchParams.get('orderItemId');
  const productIdParam = searchParams.get('productId');
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
  const [proofImages, setProofImages] = useState<UploadFile[]>([]);

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
      
      if (!order) {
        message.error('Order not found');
        return;
      }

      // Filter items that are delivered
      let deliverableItems = order.items.filter((item: any) => item.deliveryStatus === 'delivered');
      
      // If specific orderItemId or productId is provided, check if that specific item is delivered
      if (orderItemIdParam || productIdParam) {
        const specificItem = order.items.find((item: any) => 
          (orderItemIdParam && String(item._id) === String(orderItemIdParam)) ||
          (productIdParam && String(item.productId) === String(productIdParam))
        );
        
        if (!specificItem) {
          message.error('Order item not found');
          return;
        }
        
        if (specificItem.deliveryStatus !== 'delivered') {
          message.warning('This item must be delivered to create a return request');
          return;
        }
        
        // Only show this specific item for return
        deliverableItems = [specificItem];
      }

      if (deliverableItems.length === 0) {
        message.warning('No delivered items found. Order items must be delivered to create a return request');
        return;
      }

      // Create a filtered order object with only deliverable items
      const filteredOrder = {
        ...order,
        items: deliverableItems,
      };
      
      setSelectedOrder(filteredOrder);
      
      // Initialize form with deliverable order items
      const items = deliverableItems.map((item: any) => ({
        productId: item.productId,
        return: orderItemIdParam || productIdParam ? true : false, // Auto-select if specific item provided
        quantity: orderItemIdParam || productIdParam ? item.quantity : 0, // Auto-set quantity if specific item
        reason: '',
      }));
      form.setFieldsValue({ items, reason: '' });
      setProofImages([]);
      setCreateReturnModalVisible(true);
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

      if (!values.reason || values.reason.trim().length === 0) {
        message.warning('Please provide a reason for return');
        return;
      }

      // Get file list from proof images
      const proofImageFiles = proofImages
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj as File);

      await createReturnRequestApi(selectedOrder._id, items, values.reason, proofImageFiles);
      message.success('Return request created successfully and submitted to support team');
      setCreateReturnModalVisible(false);
      form.resetFields();
      setProofImages([]);
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
        text: 'Pending Support',
      },
      assigned_support: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Support Assigned',
      },
      assigned_agency: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Agency Assigned',
      },
      assigned_deliverer: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Deliverer Assigned',
      },
      picked_up: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Picked Up',
      },
      submitted_to_support: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Submitted to Support',
      },
      in_inspection: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'In Inspection',
      },
      inspector_assigned: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Inspector Assigned',
      },
      inspection_accepted: {
        color: 'processing',
        icon: <CheckCircleOutlined />,
        text: 'Inspection Accepted',
      },
      inspection_rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Inspection Rejected',
      },
      refund_processing: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Processing Refund',
      },
      refunded: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Refunded',
      },
      re_delivery: {
        color: 'warning',
        icon: <UndoOutlined />,
        text: 'Re-delivery',
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
      // Legacy statuses
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

                      {returnRequest.proofImages && returnRequest.proofImages.length > 0 && (
                        <div className="return-proof-images" style={{ marginTop: 16 }}>
                          <strong>Proof Images:</strong>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {returnRequest.proofImages.map((image: string, index: number) => (
                              <Image
                                key={index}
                                src={`${BACKEND_API}${image}`}
                                alt={`Proof ${index + 1}`}
                                width={100}
                                height={100}
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                preview={{
                                  src: `${BACKEND_API}${image}`,
                                }}
                              />
                            ))}
                          </div>
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
            <div>
              <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {selectedReturn.refundId && (
                    <div>
                      <Text strong>Refund ID: </Text>
                      <Text code copyable>{selectedReturn.refundId}</Text>
                    </div>
                  )}
                  
                  <div>
                    <Text strong>Refund Status: </Text>
                    <Tag 
                      color={
                        selectedReturn.refundStatus === 'succeeded' ? 'success' :
                        selectedReturn.refundStatus === 'failed' ? 'error' :
                        selectedReturn.refundStatus === 'processing' ? 'processing' :
                        'warning'
                      }
                    >
                      {selectedReturn.refundStatus ? selectedReturn.refundStatus.replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Pending'}
                    </Tag>
                  </div>

                  {(selectedReturn.refundAmount || selectedReturn.returnAmount) && (
                    <div>
                      <Text strong>Refund Amount: </Text>
                      <Text style={{ fontSize: '16px', color: '#1890ff' }}>
                        ${(((selectedReturn.refundAmount || selectedReturn.returnAmount) || 0) / 100).toFixed(2)} {selectedReturn.orderId?.currency?.toUpperCase() || 'USD'}
                      </Text>
                    </div>
                  )}

                  {selectedReturn.refundCreatedAt && (
                    <div>
                      <Text strong>Refund Requested: </Text>
                      <Text>
                        {new Date(selectedReturn.refundCreatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </div>
                  )}

                  {selectedReturn.refundCompletedAt && (
                    <div>
                      <Text strong>Refund Completed: </Text>
                      <Text>
                        {new Date(selectedReturn.refundCompletedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </div>
                  )}

                  {selectedReturn.refundFailureReason && (
                    <div>
                      <Text strong style={{ color: '#ff4d4f' }}>Refund Failure Reason: </Text>
                      <Text style={{ color: '#ff4d4f' }}>{selectedReturn.refundFailureReason}</Text>
                    </div>
                  )}

                  {selectedReturn.returnStatus === 'refunded' && !selectedReturn.refundFailureReason && (
                    <div>
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Refund completed successfully
                      </Tag>
                    </div>
                  )}
                </Space>
              </Card>
            </div>
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
            setProofImages([]);
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

              <Form.Item
                label="Proof Images"
                help="Upload images as proof (e.g., damaged item, wrong item, etc.). Maximum 5 images."
              >
                <Upload
                  listType="picture-card"
                  fileList={proofImages}
                  onChange={({ fileList }) => setProofImages(fileList)}
                  beforeUpload={() => false} // Prevent auto upload
                  multiple
                  maxCount={5}
                  accept="image/*"
                >
                  {proofImages.length < 5 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
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
