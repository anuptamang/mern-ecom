import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Select, message, Empty, Spin, Typography, Space, Image, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  UserOutlined,
  EyeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from 'hooks';
import { 
  getAgencyDeliveriesApi, 
  getAgencyPersonsApi, 
  assignToDeliveryPersonApi,
  getDeliveryTrackingApi,
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

  useEffect(() => {
    loadDeliveries();
  }, []);

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
      setDeliveryTracking(data.delivery);
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
        <Title level={2}>Delivery Agency Dashboard</Title>
        <Text type="secondary">Manage deliveries assigned to your agency</Text>

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
                      {delivery.status === 'in_facility' || delivery.status === 'in_transit' ? (
                        <Button
                          type="primary"
                          icon={<AssignOutlined />}
                          onClick={() => handleAssignPerson(delivery)}
                          disabled={!!delivery.assignedDeliveryPerson}
                        >
                          {delivery.assignedDeliveryPerson ? 'Assigned' : 'Assign Person'}
                        </Button>
                      ) : null}
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
                    {delivery.deliveryAddress && (
                      <div>
                        <Text strong>Delivery Address: </Text>
                        <Text>
                          {delivery.orderId.deliveryAddress?.street}, {delivery.orderId.deliveryAddress?.city}, {delivery.orderId.deliveryAddress?.state}
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
    </div>
  );
};

export default DeliveryAgencyDashboard;

