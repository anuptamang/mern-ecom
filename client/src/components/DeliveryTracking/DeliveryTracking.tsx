import React, { useState, useEffect } from 'react';
import { Card, Steps, Tag, Timeline, Typography, Empty, Button, Modal, Select, Input, Space, message } from 'antd';
import { 
  ShoppingOutlined, 
  CheckCircleOutlined, 
  CarOutlined,
  HomeOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { IDeliveryTracking } from 'types/delivery/deliveryTypes';
import { updateDeliveryStatusApi } from 'services/endPoints/delivery';
import { getAgencyPersonsApi } from 'services/endPoints/delivery/deliveryAssignmentEndpoints';
import { getToken } from 'utils/localStorage';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { MESSAGES } from '../../constants';

const { Text } = Typography;
const { TextArea } = Input;

interface DeliveryTrackingProps {
  delivery: IDeliveryTracking | null;
  order: any;
  isSeller?: boolean;
  onStatusUpdate?: () => void;
  orderItemId?: string;
  productId?: string;
}

export const DeliveryTracking = ({ delivery, order, isSeller = false, onStatusUpdate, orderItemId, productId }: DeliveryTrackingProps) => {
  const { result: user } = useAppSelector(authSelector);
  const userRole = user?.role;
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateNote, setUpdateNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(delivery);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>('');
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(false);

  // Update currentDelivery when delivery prop changes
  useEffect(() => {
    if (delivery) {
      setCurrentDelivery(delivery);
    }
  }, [delivery]);

  // Load delivery persons when warehouse operator opens modal and needs to assign customer deliverer
  useEffect(() => {
    if (updateModalVisible && userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery') {
      loadDeliveryPersons();
    }
  }, [updateModalVisible, selectedStatus, userRole]);

  if (!currentDelivery && !order) {
    return <Empty description="No delivery tracking information available" />;
  }

  const currentStatus = currentDelivery?.status || order?.deliveryStatus || 'packing';
  const statusHistory = currentDelivery?.statusHistory || [];

  const statusMap: Record<string, { step: number; title: string; icon: any; description: string }> = {
    packing: { step: 0, title: 'Packing', icon: <ShoppingOutlined />, description: 'Order is being prepared' },
    ready_to_ship: { step: 1, title: 'Ready to Ship', icon: <CheckCircleOutlined />, description: 'Order is packed and ready' },
    picked_up: { step: 2, title: 'Picked Up', icon: <CarOutlined />, description: 'Courier has picked up the package' },
    in_facility: { step: 3, title: 'In Delivery Facility', icon: <HomeOutlined />, description: 'Package at sorting facility' },
    in_transit: { step: 4, title: 'In Transit', icon: <CarOutlined />, description: 'Package is on the way' },
    out_for_delivery: { step: 5, title: 'Out for Delivery', icon: <CarOutlined />, description: 'Out for delivery today' },
    delivered: { step: 6, title: 'Delivered', icon: <CheckCircleOutlined />, description: 'Package delivered successfully' },
    rejected: { step: -1, title: 'Rejected', icon: <CloseCircleOutlined />, description: 'Delivery was rejected' },
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

  // Determine allowed statuses based on role and deliverer type
  const getAllowedStatuses = () => {
    if (userRole === 'seller') {
      // Sellers can only update to ready_to_ship
      return [
        { value: 'packing', label: 'Packing' },
        { value: 'ready_to_ship', label: 'Ready to Ship' },
      ];
    } else if (userRole === 'warehouse_operator') {
      // Warehouse operator can update: in_facility -> in_transit -> out_for_delivery
      const allowedStatuses = [];
      if (currentStatus === 'in_facility') {
        allowedStatuses.push({ value: 'in_transit', label: 'In Transit' });
      } else if (currentStatus === 'in_transit') {
        allowedStatuses.push({ value: 'out_for_delivery', label: 'Out for Delivery' });
      }
      return allowedStatuses;
    } else if (userRole === 'delivery_person') {
      // Check deliverer type from user object
      const delivererType = user?.delivererType;
      
      if (delivererType === 'warehouse') {
        // Warehouse deliverer can only update: picked_up -> in_facility
        return [
          { value: 'picked_up', label: 'Picked Up' },
          { value: 'in_facility', label: 'In Delivery Facility' },
        ];
      } else if (delivererType === 'customer_delivery' || delivererType === 'customer_return') {
        // Customer delivery deliverer can only update: out_for_delivery -> delivered or rejected
        // Customer return deliverer handles return pickups
        const allowedStatuses = [];
        if (currentStatus === 'out_for_delivery' && delivererType === 'customer_delivery') {
          allowedStatuses.push({ value: 'delivered', label: 'Delivered' });
          allowedStatuses.push({ value: 'rejected', label: 'Rejected' });
        }
        return allowedStatuses;
      }
      // Fallback for deliverers without type (shouldn't happen)
      return [];
    }
    return []; // Delivery agencies cannot update
  };

  const validStatuses = getAllowedStatuses();
  // Warehouse operators can only update when status is in_facility or in_transit (not out_for_delivery or beyond)
  const canUpdateWarehouse = userRole === 'warehouse_operator' && 
                             (currentStatus === 'in_facility' || currentStatus === 'in_transit') &&
                             validStatuses.length > 0;
  const canUpdateOthers = (userRole === 'seller' || userRole === 'delivery_person') && 
                          currentStatus !== 'delivered' && 
                          currentStatus !== 'cancelled' &&
                          currentStatus !== 'rejected';
  const canUpdate = canUpdateWarehouse || canUpdateOthers;

  const loadDeliveryPersons = async () => {
    try {
      setLoadingPersons(true);
      const { data } = await getAgencyPersonsApi();
      // Filter to only customer_delivery deliverers for warehouse operator
      const customerDeliverers = (data.deliveryPersons || []).filter((p: any) => p.delivererType === 'customer_delivery');
      setDeliveryPersons(customerDeliverers);
    } catch (error: any) {
      console.error('Failed to load delivery persons:', error);
      message.error(MESSAGES.ERROR.FAILED_TO_LOAD_DELIVERY_PERSONS);
    } finally {
      setLoadingPersons(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !order?._id) return;
    
    // Warehouse operator must assign customer deliverer when updating to out_for_delivery
    if (userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery') {
      if (!selectedDeliveryPersonId) {
        message.error(MESSAGES.WARNING.SELECT_CUSTOMER_DELIVERER);
        return;
      }
      // Note is optional - backend will auto-populate with deliverer info
    }
    
    setUpdating(true);
    try {
      const token = getToken();
      if (!token) {
        message.error(MESSAGES.ERROR.AUTHENTICATION_REQUIRED);
        return;
      }
      // Use orderItemId/productId from props, or extract from delivery object
      const itemId = orderItemId || (currentDelivery as any)?.orderItemId;
      const prodId = productId || (currentDelivery as any)?.productId;
      // For warehouse operator updating to out_for_delivery, include deliveryPersonId
      const deliveryPersonId = (userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery') 
        ? selectedDeliveryPersonId 
        : undefined;
      const response = await updateDeliveryStatusApi(order._id, selectedStatus, updateNote, itemId, prodId, deliveryPersonId);
      message.success(MESSAGES.SUCCESS.DELIVERY_STATUS_UPDATED);
      setUpdateModalVisible(false);
      setSelectedStatus('');
      setUpdateNote('');
      setSelectedDeliveryPersonId('');
      
      // Update the current delivery with the response data
      if (response?.data?.delivery) {
        setCurrentDelivery(response.data.delivery);
      }
      
      // Reload tracking data from API to get the latest status
      try {
        const { getDeliveryTrackingApi } = await import('services/endPoints/delivery');
        const { data } = await getDeliveryTrackingApi(order._id);
        if (data.deliveries) {
          const updatedDelivery = data.deliveries.find(
            (d: any) => (itemId && String(d.orderItemId) === String(itemId)) ||
                       (prodId && String(d.productId) === String(prodId)) ||
                       (!itemId && !prodId && data.deliveries[0])
          );
          if (updatedDelivery) {
            setCurrentDelivery(updatedDelivery);
          }
        } else if (data.delivery) {
          setCurrentDelivery(data.delivery);
        }
      } catch (reloadError) {
        console.error('Failed to reload delivery tracking:', reloadError);
      }
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.FAILED_TO_UPDATE_DELIVERY_STATUS);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card 
        title="Delivery Tracking"
        className="delivery-tracking"
        extra={canUpdate ? (
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
      {currentDelivery?.trackingNumber && (
        <div className="mb-4">
          <Text strong>Tracking Number: </Text>
          <Tag color="blue">{currentDelivery.trackingNumber}</Tag>
        </div>
      )}

      {currentDelivery?.carrier && (
        <div className="mb-4">
          <Text strong>Carrier: </Text>
          <Text>{currentDelivery.carrier}</Text>
        </div>
      )}

      {currentDelivery?.estimatedDeliveryDate && (
        <div className="mb-4">
          <Text strong>Estimated Delivery: </Text>
          <Text>{new Date(currentDelivery.estimatedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
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
        setSelectedDeliveryPersonId('');
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
            onChange={(value) => {
              setSelectedStatus(value);
              // Clear delivery person selection when status changes
              if (value !== 'out_for_delivery') {
                setSelectedDeliveryPersonId('');
              }
            }}
            style={{ width: '100%' }}
            options={validStatuses.map(s => ({
              value: s.value,
              label: s.label,
              disabled: s.value === currentStatus,
            }))}
          />
        </div>
        
        {/* Warehouse operator must assign customer deliverer when updating to out_for_delivery */}
        {userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery' && (
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Assign Customer Deliverer <span style={{ color: 'red' }}>*</span>:
            </label>
            <Select
              value={selectedDeliveryPersonId}
              onChange={setSelectedDeliveryPersonId}
              style={{ width: '100%' }}
              loading={loadingPersons}
              placeholder="Select a customer deliverer"
              options={deliveryPersons.map(p => ({
                value: p._id,
                label: `${p.fullName} (${p.phone || 'No phone'})`,
              }))}
            />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
              Select the customer deliverer who will complete the final delivery. Deliverer information will be automatically included.
            </Text>
          </div>
        )}
        
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Note {userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery' ? (
              <span style={{ color: 'red' }}>*</span>
            ) : '(optional)'}:
          </label>
          <TextArea
            rows={3}
            placeholder={
              userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery'
                ? "Enter delivery person details: Name, Phone Number, etc."
                : "Add a note about this status update..."
            }
            value={updateNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUpdateNote(e.target.value)}
          />
          {userRole === 'warehouse_operator' && selectedStatus === 'out_for_delivery' && (
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
              Include delivery person name, phone number, and any relevant details
            </Text>
          )}
        </div>
      </Space>
    </Modal>
    </>
  );
};
