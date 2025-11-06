'use client';

import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks';
import { useSearchParams } from 'next/navigation';
import { 
  getWarehouseOperatorDeliveriesApi,
  getDeliveryTrackingApi,
} from '@/services/endPoints/delivery';
import { DeliveryTracking } from '@/components';
import './WarehouseOperatorDashboard.scss';

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
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  statusHistory: any[];
}

const WarehouseOperatorDashboard = () => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);

  useEffect(() => {
    loadDeliveries();
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
      const { data } = await getWarehouseOperatorDeliveriesApi();
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
      setDeliveryTracking(null); // Reset tracking data
      
      const { data } = await getDeliveryTrackingApi(delivery.orderId._id);
      // API now returns deliveries array (per-item tracking)
      // Find the specific delivery for this item
      const itemDelivery = data.deliveries?.find(
        (d: any) => String(d._id) === String(delivery._id) ||
                   (delivery.orderItemId && String(d.orderItemId) === String(delivery.orderItemId)) ||
                   (delivery.productId && String(d.productId) === String(delivery.productId))
      ) || data.deliveries?.[0] || data.delivery || delivery;
      
      setDeliveryTracking(itemDelivery || delivery);
    } catch (error: any) {
      console.error('Failed to load delivery tracking:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load delivery tracking';
      message.error(errorMessage);
      // Still show the delivery info even if tracking fails
      setDeliveryTracking(delivery);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      in_facility: { color: 'blue', icon: <ClockCircleOutlined /> },
      in_transit: { color: 'orange', icon: <CarOutlined /> },
      out_for_delivery: { color: 'purple', icon: <CarOutlined /> },
      delivered: { color: 'green', icon: <CheckCircleOutlined /> },
    };
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="warehouse-operator-dashboard">
      <Card>
        <Title level={2}>Warehouse Operator Dashboard</Title>
        <Text type="secondary">
          Manage packages in the delivery facility. Update status from "In Facility" to "In Transit" to "Out for Delivery".
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Deliveries ({deliveries.length})</Title>
        {deliveries.length === 0 ? (
          <Empty description="No deliveries to manage" />
        ) : (
          <List
            dataSource={deliveries}
            renderItem={(delivery) => {
              const order = delivery.orderId;
              const orderItem = order?.items?.find(
                (item: any) => String(item._id) === String(delivery.orderItemId) ||
                             String(item.productId) === String(delivery.productId)
              );
              
              return (
                <List.Item
                  key={delivery._id}
                  actions={[
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewTracking(delivery)}
                    >
                      View Tracking
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>
                          Order #{order?._id?.toString().slice(-8) || 'N/A'}
                        </Text>
                        {getStatusTag(delivery.status)}
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          <Text>Item: </Text>
                          <Text strong>{orderItem?.title || 'Product'}</Text>
                        </div>
                        {order?.deliveryAddress && (
                          <div>
                            <Text>Address: </Text>
                            <Text type="secondary">
                              {order.deliveryAddress.city}, {order.deliveryAddress.state}
                            </Text>
                          </div>
                        )}
                        {delivery.assignedDeliveryPerson && (
                          <div>
                            <Text>Assigned Deliverer: </Text>
                            <Text strong>
                              {delivery.assignedDeliveryPerson.fullName || 'N/A'}
                            </Text>
                            {delivery.assignedDeliveryPerson.phone && (
                              <Text type="secondary"> ({delivery.assignedDeliveryPerson.phone})</Text>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

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
        {deliveryTracking && selectedDelivery && (
          <DeliveryTracking
            delivery={deliveryTracking}
            order={selectedDelivery.orderId}
            onStatusUpdate={() => {
              loadDeliveries();
              // Reload tracking data
              if (selectedDelivery?.orderId?._id) {
                handleViewTracking(selectedDelivery);
              }
            }}
            orderItemId={selectedDelivery.orderItemId}
            productId={selectedDelivery.productId}
          />
        )}
      </Modal>
    </div>
  );
};

export default WarehouseOperatorDashboard;
