import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Select, message, Empty, Spin, Typography, Space, Image, Divider, Form, Input } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  UserOutlined,
  EyeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import { 
  getAgencyDeliveriesApi, 
  getAgencyPersonsApi, 
  assignToDeliveryPersonApi,
  getDeliveryTrackingApi,
  createDeliveryPersonApi,
} from 'services/endPoints/delivery';
import { DeliveryTracking } from 'components';
import './DeliveryAgencyDashboard.scss';

const { Text, Title } = Typography;

interface IDelivery {
  _id: string;
  orderId: {
    _id: string;
    userId: any;
    items: any[];
    amount: number;
    deliveryAddress: any;
    status: string;
  };
  orderItemId?: string;
  productId?: any;
  status: string;
  assignedDeliveryPerson?: any;
  assignedDeliveryAgency: any;
  assignedAt?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  statusHistory: any[];
}

const DeliveryAgencyDashboard = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigningToDeliveryId, setAssigningToDeliveryId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [createPersonModalVisible, setCreatePersonModalVisible] = useState(false);
  const [creatingPerson, setCreatingPerson] = useState(false);
  const [createPersonForm] = Form.useForm();

  useEffect(() => {
    loadDeliveries();
    loadDeliveryPersons();
  }, []);

  // Handle URL params for notification navigation
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const orderItemId = searchParams.get('orderItemId');
    const productId = searchParams.get('productId');
    
    if (orderId && deliveries.length > 0) {
      const delivery = deliveries.find(
        (d) => String(d.orderId._id) === orderId &&
               (!orderItemId || String(d.orderItemId) === orderItemId) &&
               (!productId || String(d.productId) === productId)
      );
      if (delivery) {
        handleViewTracking(delivery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, deliveries]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await getAgencyDeliveriesApi();
      setDeliveries(data.deliveries || []);
    } catch (error: any) {
      console.error('Failed to load deliveries:', error);
      message.error(error?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryPersons = async () => {
    try {
      setLoadingPersons(true);
      const { data } = await getAgencyPersonsApi();
      setDeliveryPersons(data.deliveryPersons || []);
    } catch (error: any) {
      console.error('Failed to load delivery persons:', error);
      message.error(error?.response?.data?.message || 'Failed to load delivery persons');
    } finally {
      setLoadingPersons(false);
    }
  };

  const handleViewTracking = async (delivery: IDelivery) => {
    try {
      setSelectedDelivery(delivery);
      setTrackingModalVisible(true);
      const { data } = await getDeliveryTrackingApi(delivery.orderId._id);
      // API now returns deliveries array (per-item tracking)
      // Find the specific delivery for this item
      const itemDelivery = data.deliveries?.find(
        (d: any) => String(d._id) === String(delivery._id) ||
                   (delivery.orderItemId && String(d.orderItemId) === String(delivery.orderItemId)) ||
                   (delivery.productId && String(d.productId) === String(delivery.productId))
      ) || data.deliveries?.[0] || data.delivery || delivery;
      setDeliveryTracking(itemDelivery);
    } catch (error: any) {
      console.error('Failed to load delivery tracking:', error);
      message.error('Failed to load delivery tracking');
    }
  };

  const handleAssignPerson = async (delivery: IDelivery) => {
    setAssigningToDeliveryId(delivery._id);
    setAssignModalVisible(true);
    await loadDeliveryPersons();
  };

  const handleConfirmAssignment = async () => {
    if (!selectedPersonId || !assigningToDeliveryId) {
      message.error('Please select a delivery person');
      return;
    }

    try {
      setAssigning(true);
      const delivery = deliveries.find(d => d._id === assigningToDeliveryId);
      if (!delivery) {
        message.error('Delivery not found');
        return;
      }

      await assignToDeliveryPersonApi(delivery.orderId._id, selectedPersonId);
      message.success('Delivery assigned to person successfully');
      setAssignModalVisible(false);
      setSelectedPersonId('');
      setAssigningToDeliveryId(null);
      await loadDeliveries();
    } catch (error: any) {
      console.error('Failed to assign delivery:', error);
      message.error(error?.response?.data?.message || 'Failed to assign delivery');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreatePerson = async (values: any) => {
    try {
      setCreatingPerson(true);
      await createDeliveryPersonApi(values.email, values.password, values.fullName, values.phone);
      message.success('Delivery person created successfully');
      setCreatePersonModalVisible(false);
      createPersonForm.resetFields();
      await loadDeliveryPersons();
    } catch (error: any) {
      console.error('Failed to create delivery person:', error);
      message.error(error?.response?.data?.message || 'Failed to create delivery person');
    } finally {
      setCreatingPerson(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      packing: 'default',
      ready_to_ship: 'blue',
      picked_up: 'cyan',
      in_facility: 'geekblue',
      in_transit: 'purple',
      out_for_delivery: 'orange',
      delivered: 'success',
      cancelled: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="delivery-agency-dashboard">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Delivery Agency Dashboard</Title>
            <Text type="secondary">Manage deliveries assigned to your agency</Text>
          </div>
          <Button type="primary" onClick={() => setCreatePersonModalVisible(true)}>
            Add Deliverer
          </Button>
        </div>

        <Divider />

        {deliveries.length === 0 ? (
          <Empty description="No deliveries assigned to your agency" />
        ) : (
          <List
            dataSource={deliveries}
            renderItem={(delivery) => (
              <List.Item>
                <Card
                  style={{ width: '100%' }}
                  title={
                    <Space>
                      <Text strong>Order #{delivery.orderId._id.slice(-8)}</Text>
                      <Tag color={getStatusColor(delivery.status)}>
                        {getStatusLabel(delivery.status)}
                      </Tag>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTracking(delivery)}
                      >
                        View Tracking
                      </Button>
                      {(delivery.status === 'ready_to_ship' || delivery.status === 'picked_up' || delivery.status === 'in_facility' || delivery.status === 'in_transit') && (
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={() => handleAssignPerson(delivery)}
                          disabled={!!delivery.assignedDeliveryPerson}
                        >
                          {delivery.assignedDeliveryPerson ? 'Assigned' : 'Assign Person'}
                        </Button>
                      )}
                    </Space>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div>
                      <Text strong>Buyer: </Text>
                      <Text>
                        {delivery.orderId.userId?.fullName || delivery.orderId.userId?.email || 'Unknown'}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Items: </Text>
                      <Text>{delivery.orderId.items?.length || 0} item(s)</Text>
                    </div>
                    <div>
                      <Text strong>Amount: </Text>
                      <Text>${(delivery.orderId.amount / 100).toFixed(2)}</Text>
                    </div>
                    {delivery.assignedDeliveryPerson && (
                      <div>
                        <Text strong>Assigned To: </Text>
                        <Text>
                          {delivery.assignedDeliveryPerson.fullName || delivery.assignedDeliveryPerson.email}
                        </Text>
                      </div>
                    )}
                    {delivery.assignedAt && (
                      <div>
                        <Text strong>Assigned At: </Text>
                        <Text>{new Date(delivery.assignedAt).toLocaleString()}</Text>
                      </div>
                    )}
                    {delivery.orderId?.deliveryAddress && (
                      <div>
                        <Text strong>Delivery Address: </Text>
                        <Text>
                          {delivery.orderId.deliveryAddress.street}, {delivery.orderId.deliveryAddress.city}, {delivery.orderId.deliveryAddress.state} {delivery.orderId.deliveryAddress.zipCode}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Delivery Tracking Modal */}
      <Modal
        title="Delivery Tracking"
        open={trackingModalVisible}
        onCancel={() => {
          setTrackingModalVisible(false);
          setSelectedDelivery(null);
          setDeliveryTracking(null);
        }}
        footer={null}
        width={800}
      >
        {selectedDelivery && (
          <DeliveryTracking
            delivery={deliveryTracking}
            order={selectedDelivery.orderId}
            isSeller={false}
            onStatusUpdate={loadDeliveries}
          />
        )}
      </Modal>

      {/* Assign Person Modal */}
      <Modal
        title="Assign Delivery Person"
        open={assignModalVisible}
        onOk={handleConfirmAssignment}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedPersonId('');
          setAssigningToDeliveryId(null);
        }}
        okText="Assign"
        okButtonProps={{ loading: assigning }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select Delivery Person:</Text>
          </div>
          {loadingPersons ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder="Select a delivery person"
              value={selectedPersonId}
              onChange={setSelectedPersonId}
              options={deliveryPersons.map((person) => ({
                value: person._id,
                label: `${person.fullName || person.email} (${person.phone || 'No phone'})`,
              }))}
            />
          )}
          {deliveryPersons.length === 0 && !loadingPersons && (
            <Text type="secondary">No delivery persons available</Text>
          )}
        </Space>
      </Modal>

      {/* Create Delivery Person Modal */}
      <Modal
        title="Add Delivery Person"
        open={createPersonModalVisible}
        onOk={() => createPersonForm.submit()}
        onCancel={() => {
          setCreatePersonModalVisible(false);
          createPersonForm.resetFields();
        }}
        okText="Create"
        okButtonProps={{ loading: creatingPerson }}
        width={500}
      >
        <Form
          form={createPersonForm}
          layout="vertical"
          onFinish={handleCreatePerson}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone (Optional)"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeliveryAgencyDashboard;

