import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Upload, message, Empty, Spin, Typography, Space, Input, Image } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  EyeOutlined,
  CheckOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useAuth } from 'hooks';
import { 
  getPersonDeliveriesApi,
  getDeliveryTrackingApi,
  markAsDeliveredApi,
} from 'services/endPoints/delivery';
import { DeliveryTracking } from 'components';
import type { UploadFile } from 'antd/es/upload/interface';
import './DeliveryPersonDashboard.scss';

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
  assignedDeliveryPerson: any;
  assignedDeliveryAgency: any;
  deliveryProof?: string;
  buyerAcceptance: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  statusHistory: any[];
}

const DeliveryPersonDashboard = () => {
  const auth = useAuth();
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [deliveringToDeliveryId, setDeliveringToDeliveryId] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryProofFile, setDeliveryProofFile] = useState<File | null>(null);
  const [deliveryProofPreview, setDeliveryProofPreview] = useState<string | null>(null);
  const [delivering, setDelivering] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await getPersonDeliveriesApi();
      setDeliveries(data.deliveries || []);
    } catch (error: any) {
      console.error('Failed to load deliveries:', error);
      message.error(error?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
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

  const handleMarkDelivered = (delivery: IDelivery) => {
    setDeliveringToDeliveryId(delivery._id);
    setDeliverModalVisible(true);
    setDeliveryNote('');
    setDeliveryProofFile(null);
    setDeliveryProofPreview(null);
  };

  const handleProofUpload = (file: File) => {
    setDeliveryProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDeliveryProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleConfirmDelivery = async () => {
    if (!deliveringToDeliveryId) {
      message.error('Delivery not found');
      return;
    }

    if (!deliveryProofFile) {
      message.warning('Please upload delivery proof photo');
      return;
    }

    try {
      setDelivering(true);
      const delivery = deliveries.find(d => d._id === deliveringToDeliveryId);
      if (!delivery) {
        message.error('Delivery not found');
        return;
      }

      await markAsDeliveredApi(
        delivery.orderId._id,
        deliveryNote || undefined,
        deliveryProofFile
      );
      message.success('Delivery marked as delivered successfully');
      setDeliverModalVisible(false);
      setDeliveryNote('');
      setDeliveryProofFile(null);
      setDeliveryProofPreview(null);
      setDeliveringToDeliveryId(null);
      await loadDeliveries();
    } catch (error: any) {
      console.error('Failed to mark as delivered:', error);
      message.error(error?.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setDelivering(false);
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

  const getBuyerAcceptanceColor = (acceptance: string) => {
    if (acceptance === 'accepted') return 'success';
    if (acceptance === 'rejected') return 'error';
    return 'warning';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="delivery-person-dashboard">
      <Card>
        <Title level={2}>Delivery Person Dashboard</Title>
        <Text type="secondary">Manage deliveries assigned to you</Text>

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
                    {delivery.status === 'delivered' && (
                      <Tag color={getBuyerAcceptanceColor(delivery.buyerAcceptance)}>
                        Buyer: {delivery.buyerAcceptance}
                      </Tag>
                    )}
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
                    {delivery.status === 'out_for_delivery' && (
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleMarkDelivered(delivery)}
                      >
                        Mark as Delivered
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
                  {delivery.orderId?.deliveryAddress && (
                    <div>
                      <Text strong>Delivery Address: </Text>
                      <Text>
                        {delivery.orderId.deliveryAddress.street}, {delivery.orderId.deliveryAddress.city}, {delivery.orderId.deliveryAddress.state} {delivery.orderId.deliveryAddress.zipCode}
                      </Text>
                    </div>
                  )}
                  {delivery.deliveryProof && (
                    <div>
                      <Text strong>Delivery Proof: </Text>
                      <Image
                        src={delivery.deliveryProof}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                  )}
                </Space>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: <Empty description="No deliveries assigned to you" /> }}
        />
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

      {/* Mark as Delivered Modal */}
      <Modal
        title="Mark as Delivered"
        open={deliverModalVisible}
        onOk={handleConfirmDelivery}
        onCancel={() => {
          setDeliverModalVisible(false);
          setDeliveryNote('');
          setDeliveryProofFile(null);
          setDeliveryProofPreview(null);
          setDeliveringToDeliveryId(null);
        }}
        okText="Mark Delivered"
        okButtonProps={{ loading: delivering }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Upload Delivery Proof (Required):</Text>
            <Upload
              accept="image/*"
              beforeUpload={handleProofUpload}
              showUploadList={false}
              maxCount={1}
            >
              <Button icon={<CameraOutlined />}>Select Photo</Button>
            </Upload>
            {deliveryProofPreview && (
              <div style={{ marginTop: 10 }}>
                <Image
                  src={deliveryProofPreview}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              </div>
            )}
          </div>
          <div>
            <Text strong>Note (Optional):</Text>
            <TextArea
              rows={3}
              placeholder="Add a note about the delivery..."
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DeliveryPersonDashboard;

