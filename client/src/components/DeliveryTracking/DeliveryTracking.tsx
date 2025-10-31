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
}

export const DeliveryTracking = ({ delivery, order }: DeliveryTrackingProps) => {
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

  return (
    <Card title="Delivery Tracking" className="delivery-tracking">
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
  );
};

