import { Card, Steps, Tag, Timeline, Typography, Empty } from 'antd';
import { 
  ShoppingOutlined, 
  CheckCircleOutlined, 
  CarOutlined,
  HomeOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { IDeliveryTracking } from 'types/delivery/deliveryTypes';

const { Text } = Typography;

interface DeliveryTrackingProps {
  delivery: IDeliveryTracking | null;
  order: any;
  isSeller?: boolean;
  onStatusUpdate?: () => void;
}

export const DeliveryTracking = ({ delivery, order, isSeller = false, onStatusUpdate }: DeliveryTrackingProps) => {
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateNote, setUpdateNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  if (!delivery && !order) {
    return <Empty description="No delivery tracking information available" />;
  }

  const currentStatus = delivery?.status || order?.deliveryStatus || 'packing';
  const statusHistory = delivery?.statusHistory || [];

  const statusMap: Record<string, { step: number; title: string; icon: any; description: string }> = {
    packing: { step: 0, title: 'Packing', icon: <ShoppingOutlined />, description: 'Order is being prepared' },
    ready_to_ship: { step: 1, title: 'Ready to Ship', icon: <CheckCircleOutlined />, description: 'Order is packed and ready' },
    picked_up: { step: 2, title: 'Picked Up', icon: <CarOutlined />, description: 'Courier has picked up the package' },
    in_facility: { step: 3, title: 'In Delivery Facility', icon: <HomeOutlined />, description: 'Package at sorting facility' },
    in_transit: { step: 4, title: 'In Transit', icon: <CarOutlined />, description: 'Package is on the way' },
    out_for_delivery: { step: 5, title: 'Out for Delivery', icon: <CarOutlined />, description: 'Out for delivery today' },
    delivered: { step: 6, title: 'Delivered', icon: <CheckCircleOutlined />, description: 'Package delivered successfully' },
    cancelled: { step: -1, title: 'Cancelled', icon: <CloseCircleOutlined />, description: 'Order has been cancelled' },
  };

  const currentStatusInfo = statusMap[currentStatus] || statusMap.packing;
  const steps = [
    'Packing',
    'Ready to Ship',
    'Picked Up',
    'In Delivery Facility',
    'In Transit',
    'Out for Delivery',
    'Delivered',
  ];

  const getStepStatus = (stepIndex: number) => {
    if (currentStatus === 'cancelled') return 'error';
    if (stepIndex < currentStatusInfo.step) return 'finish';
    if (stepIndex === currentStatusInfo.step) return 'process';
    return 'wait';
  };

  const validStatuses = [
    { value: 'packing', label: 'Packing' },
    { value: 'ready_to_ship', label: 'Ready to Ship' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'in_facility', label: 'In Delivery Facility' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
  ];

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !order?._id) return;
    
    setUpdating(true);
    try {
      const token = getToken();
      if (!token) {
        message.error('Authentication required');
        return;
      }
      await updateDeliveryStatusApi(order._id, selectedStatus, updateNote);
      message.success('Delivery status updated successfully');
      setUpdateModalVisible(false);
      setSelectedStatus('');
      setUpdateNote('');
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card 
        title="Delivery Tracking"
        className="delivery-tracking"
        extra={isSeller && currentStatus !== 'delivered' && currentStatus !== 'cancelled' ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedStatus(currentStatus);
              setUpdateModalVisible(true);
            }}
          >
            Update Status
          </Button>
        ) : null}
      >
      {delivery?.trackingNumber && (
        <div className="mb-4">
          <Text strong>Tracking Number: </Text>
          <Tag color="blue">{delivery.trackingNumber}</Tag>
        </div>
      )}

      {delivery?.carrier && (
        <div className="mb-4">
          <Text strong>Carrier: </Text>
          <Text>{delivery.carrier}</Text>
        </div>
      )}

      {delivery?.estimatedDeliveryDate && (
        <div className="mb-4">
          <Text strong>Estimated Delivery: </Text>
          <Text>{new Date(delivery.estimatedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </div>
      )}

      <Steps
        current={currentStatus === 'cancelled' ? undefined : currentStatusInfo.step}
        status={currentStatus === 'cancelled' ? 'error' : getStepStatus(currentStatusInfo.step)}
        direction="vertical"
        size="small"
        items={steps.map((step, index) => ({
          title: step,
          description: index === currentStatusInfo.step ? currentStatusInfo.description : undefined,
          status: getStepStatus(index),
        }))}
      />

      {statusHistory.length > 0 && (
        <div className="mt-6">
          <h4>Status History</h4>
          <Timeline>
            {statusHistory
              .slice()
              .reverse()
              .map((entry, index) => (
                <Timeline.Item key={index} color={entry.status === 'cancelled' ? 'red' : 'blue'}>
                  <div>
                    <Text strong>{statusMap[entry.status]?.title || entry.status}</Text>
                    <div>
                      <Text type="secondary">{new Date(entry.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                    </div>
                    {entry.note && (
                      <div>
                        <Text type="secondary" style={{ fontStyle: 'italic' }}>{entry.note}</Text>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
          </Timeline>
        </div>
      )}

      {order?.deliveryAddress && (
        <div className="mt-6">
          <h4>Delivery Address</h4>
          <Card size="small">
            <Text>
              {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}, {order.deliveryAddress.country}
            </Text>
          </Card>
        </div>
      )}
    </Card>

    <Modal
      title="Update Delivery Status"
      open={updateModalVisible}
      onOk={handleUpdateStatus}
      onCancel={() => {
        setUpdateModalVisible(false);
        setSelectedStatus('');
        setUpdateNote('');
      }}
      okText="Update Status"
      okButtonProps={{ loading: updating }}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Status:</label>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: '100%' }}
            options={validStatuses.map(s => ({
              value: s.value,
              label: s.label,
              disabled: s.value === currentStatus,
            }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Note (optional):</label>
          <TextArea
            rows={3}
            placeholder="Add a note about this status update..."
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
          />
        </div>
      </Space>
    </Modal>
    </>
  );
};

