'use client';

import { Card, List, Tag, Spin, Empty, message, Button, Image, Modal, Popconfirm, Input, Space, Form, Checkbox, InputNumber, Upload, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined as DeleteIcon } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Container } from '@/components/UI';
import { ProductImage } from '@/components/ProductImage';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { getMyReturnsApi, cancelReturnApi, createReturnRequestApi } from '@/services/endPoints/return';
import { listMyOrdersApi } from '@/services/endPoints/orders/ordersEndpoints';
import { BACKEND_API } from '@/configs/api';
import { getToken } from '@/utils/localStorage';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, StopOutlined, UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import './ReturnsDashboard.scss';

const { Text } = Typography;

type TProps = {};

const ReturnsDashboard = (props: TProps) => {
  const title = usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.replace(`/${pageRoutes.userReturns}`);
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
      in_pickup: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'In Pickup',
      },
      picked_up: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Picked Up',
      },
      in_transit: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'In Transit',
      },
      at_facility: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'At Facility',
      },
      assigned_inspector: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Inspector Assigned',
      },
      inspection_pending: {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'Inspection Pending',
      },
      inspection_completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Inspection Completed',
      },
      accepted: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Accepted',
      },
      rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Rejected',
      },
      assigned_finance: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Finance Assigned',
      },
      refund_processing: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Refund Processing',
      },
      refund_completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Refund Completed',
      },
      cancelled: {
        color: 'default',
        icon: <StopOutlined />,
        text: 'Cancelled',
      },
      re_delivery: {
        color: 'processing',
        icon: <UndoOutlined />,
        text: 'Re-Delivery',
      },
      re_delivered: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Re-Delivered',
      },
    };

    const config = statusConfig[status] || {
      color: 'default',
      icon: <ClockCircleOutlined />,
      text: status,
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const handleViewDetails = (returnItem: any) => {
    setSelectedReturn(returnItem);
    setReturnModalVisible(true);
  };

  const handleCreateReturnClick = () => {
    // Load orders to select from
    loadOrders();
  };

  const loadOrders = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const { data } = await listMyOrdersApi(token);
      const orders = data.orders || [];
      
      // Filter orders that have delivered items
      const ordersWithDeliveredItems = orders.filter((order: any) => 
        order.items.some((item: any) => item.deliveryStatus === 'delivered')
      );

      if (ordersWithDeliveredItems.length === 0) {
        message.warning('No orders with delivered items found');
        return;
      }

      // Show order selection modal or directly show first order
      // For simplicity, show first order with delivered items
      const firstOrder = ordersWithDeliveredItems[0];
      const deliverableItems = firstOrder.items.filter((item: any) => item.deliveryStatus === 'delivered');
      
      const filteredOrder = {
        ...firstOrder,
        items: deliverableItems,
      };
      
      setSelectedOrder(filteredOrder);
      
      // Initialize form
      const items = deliverableItems.map((item: any) => ({
        productId: item.productId,
        return: false,
        quantity: 0,
        reason: '',
      }));
      form.setFieldsValue({ items, reason: '' });
      setProofImages([]);
      setCreateReturnModalVisible(true);
    } catch (error: any) {
      message.error('Failed to load orders');
    }
  };

  return (
    <>
      {title}
      <Container>
        <Card
          title="Returns & Refunds"
          extra={
            <Button type="primary" onClick={handleCreateReturnClick}>
              Create Return Request
            </Button>
          }
        >
          {loading ? (
            <Spin />
          ) : returns.length === 0 ? (
            <Empty description="No returns found" />
          ) : (
            <List
              dataSource={returns}
              renderItem={(returnItem: any) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(returnItem)}
                    >
                      View Details
                    </Button>,
                    returnItem.returnStatus === 'pending' ||
                    returnItem.returnStatus === 'assigned_support' ? (
                      <Popconfirm
                        key="cancel"
                        title="Cancel Return Request"
                        description="Are you sure you want to cancel this return request?"
                        onConfirm={() => {
                          setCancellingReturnId(returnItem._id);
                          setCancelReturnModalVisible(true);
                        }}
                      >
                        <Button danger icon={<DeleteOutlined />}>
                          Cancel
                        </Button>
                      </Popconfirm>
                    ) : null,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>Return #{returnItem._id.slice(-6)}</Text>
                        {getStatusTag(returnItem.returnStatus)}
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          Order ID: {returnItem.orderId?.slice(-6) || 'N/A'}
                        </div>
                        <div>
                          Created: {new Date(returnItem.createdAt).toLocaleDateString()}
                        </div>
                        {returnItem.items && returnItem.items.length > 0 && (
                          <div>
                            Items: {returnItem.items.length} item(s)
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Return Details Modal */}
        <Modal
          title="Return Details"
          open={returnModalVisible}
          onCancel={() => setReturnModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setReturnModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedReturn && (
            <div>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Return ID:</Text> {selectedReturn._id}
                </div>
                <div>
                  <Text strong>Status:</Text> {getStatusTag(selectedReturn.returnStatus)}
                </div>
                <div>
                  <Text strong>Order ID:</Text> {selectedReturn.orderId}
                </div>
                <div>
                  <Text strong>Reason:</Text> {selectedReturn.reason}
                </div>
                {selectedReturn.items && selectedReturn.items.length > 0 && (
                  <div>
                    <Text strong>Items:</Text>
                    <List
                      dataSource={selectedReturn.items}
                      renderItem={(item: any) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <ProductImage
                                src={item.product?.images?.[0] || ''}
                                alt={item.product?.title}
                                width={60}
                                height={60}
                              />
                            }
                            title={item.product?.title}
                            description={
                              <div>
                                <div>Quantity: {item.quantity}</div>
                                <div>Reason: {item.reason}</div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                )}
                {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                  <div>
                    <Text strong>Proof Images:</Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {selectedReturn.proofImages.map((image: string, index: number) => (
                        <Image
                          key={index}
                          src={`${BACKEND_API}/uploads/${image}`}
                          alt={`Proof ${index + 1}`}
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selectedReturn.inspectionNote && (
                  <div>
                    <Text strong>Inspection Note:</Text> {selectedReturn.inspectionNote}
                  </div>
                )}
                {selectedReturn.refundAmount && (
                  <div>
                    <Text strong>Refund Amount:</Text> ${selectedReturn.refundAmount.toFixed(2)}
                  </div>
                )}
              </Space>
            </div>
          )}
        </Modal>

        {/* Create Return Modal */}
        <Modal
          title="Create Return Request"
          open={createReturnModalVisible}
          onCancel={() => {
            setCreateReturnModalVisible(false);
            form.resetFields();
            setProofImages([]);
            setSelectedOrder(null);
          }}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <Form
              form={form}
              onFinish={handleCreateReturn}
              layout="vertical"
            >
              <Form.Item label="Select Items to Return">
                <Form.List name="items">
                  {(fields) => (
                    <>
                      {fields.map((field, index) => {
                        const item = selectedOrder.items[index];
                        return (
                          <Form.Item key={field.key}>
                            <Space>
                              <Form.Item
                                name={[field.name, 'return']}
                                valuePropName="checked"
                                noStyle
                              >
                                <Checkbox />
                              </Form.Item>
                              <ProductImage
                                src={item.product?.images?.[0] || ''}
                                alt={item.product?.title}
                                width={60}
                                height={60}
                              />
                              <div>
                                <div>{item.product?.title}</div>
                                <div>Price: ${item.product?.price}</div>
                                <Form.Item
                                  name={[field.name, 'quantity']}
                                  noStyle
                                >
                                  <InputNumber
                                    min={0}
                                    max={item.quantity}
                                    placeholder="Quantity"
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={[field.name, 'reason']}
                                  noStyle
                                >
                                  <Input placeholder="Reason" />
                                </Form.Item>
                                <Form.Item
                                  name={[field.name, 'productId']}
                                  noStyle
                                  initialValue={item.productId}
                                >
                                  <Input type="hidden" />
                                </Form.Item>
                              </div>
                            </Space>
                          </Form.Item>
                        );
                      })}
                    </>
                  )}
                </Form.List>
              </Form.Item>

              <Form.Item
                name="reason"
                label="Return Reason"
                rules={[{ required: true, message: 'Please provide a reason for return' }]}
              >
                <Input.TextArea rows={4} placeholder="Please provide a detailed reason for returning these items" />
              </Form.Item>

              <Form.Item label="Proof Images (Optional)">
                <Upload
                  listType="picture-card"
                  fileList={proofImages}
                  onChange={({ fileList }) => setProofImages(fileList)}
                  beforeUpload={() => false}
                >
                  {proofImages.length < 5 && <UploadOutlined />}
                </Upload>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Return Request
                  </Button>
                  <Button
                    onClick={() => {
                      setCreateReturnModalVisible(false);
                      form.resetFields();
                      setProofImages([]);
                      setSelectedOrder(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Cancel Return Confirmation Modal */}
        <Modal
          title="Cancel Return Request"
          open={cancelReturnModalVisible}
          onOk={handleCancelReturn}
          onCancel={() => {
            setCancelReturnModalVisible(false);
            setCancellingReturnId(null);
          }}
        >
          <p>Are you sure you want to cancel this return request? This action cannot be undone.</p>
        </Modal>
      </Container>
    </>
  );
};

export { ReturnsDashboard };
