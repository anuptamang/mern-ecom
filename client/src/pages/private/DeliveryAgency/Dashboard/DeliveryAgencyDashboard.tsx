'use client';

import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Select, message, Empty, Spin, Typography, Space, Image, Divider, Form, Input, Radio, Tabs } from 'antd';
import { 
  LockOutlined,
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  UserOutlined,
  EyeOutlined,
  UserAddOutlined,
  ShoppingOutlined,
  UndoOutlined,
  SwapOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks';
import { useSearchParams } from 'next/navigation';
import { 
  getAgencyDeliveriesApi, 
  getAgencyPersonsApi, 
  assignToDeliveryPersonApi,
  getDeliveryTrackingApi,
  createDeliveryPersonApi,
  getWarehouseOperatorsApi,
  assignWarehouseOperatorApi,
  reassignDeliveryPersonApi,
  reassignWarehouseOperatorApi,
  rejectDeliveryAssignmentApi,
} from '@/services/endPoints/delivery';
import { getAgencyReturnsApi, assignReturnDelivererApi, reassignReturnDelivererApi, rejectReturnAssignmentApi } from '@/services/endPoints/return';
import { createUserApi, getUsersApi, resetPasswordAdminApi } from '@/services/endPoints/user/userListEndpoints';
import { DeliveryTracking, WorkloadDashboard } from '@/components';
import './DeliveryAgencyDashboard.scss';

const { TextArea } = Input;
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
  assignedWarehouseOperator?: any;
  assignedDeliveryAgency: any;
  assignedAt?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  statusHistory: any[];
}

interface IReturn {
  _id: string;
  orderId: { _id: string; items: any[] };
  userId: { fullName: string; email: string; phone?: string };
  items: any[];
  returnAmount: number;
  reason: string;
  proofImages?: string[];
  returnStatus: string;
  assignedDeliveryAgency?: any;
  assignedReturnDeliverer?: any;
  pickedUpAt?: Date;
  pickupProof?: string;
}

const DeliveryAgencyDashboard = () => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('delivery');
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assigningToDeliveryId, setAssigningToDeliveryId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedDelivererType, setSelectedDelivererType] = useState<'warehouse' | 'customer_delivery' | 'customer_return'>('warehouse');
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [warehouseOperators, setWarehouseOperators] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [loadingWarehouseOperators, setLoadingWarehouseOperators] = useState(false);
  const [createPersonModalVisible, setCreatePersonModalVisible] = useState(false);
  const [creatingPerson, setCreatingPerson] = useState(false);
  const [createPersonForm] = Form.useForm();
  const [createUserType, setCreateUserType] = useState<'delivery_person' | 'warehouse_operator'>('delivery_person');
  const [assignWarehouseOperatorModalVisible, setAssignWarehouseOperatorModalVisible] = useState(false);
  const [selectedWarehouseOperatorId, setSelectedWarehouseOperatorId] = useState<string>('');
  const [assigningWarehouseOperator, setAssigningWarehouseOperator] = useState(false);
  // Return assignment modals
  const [assignReturnDelivererModalVisible, setAssignReturnDelivererModalVisible] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [selectedReturnDelivererId, setSelectedReturnDelivererId] = useState<string>('');
  const [assigningReturnDeliverer, setAssigningReturnDeliverer] = useState(false);
  // User management
  const [childUsers, setChildUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userTab, setUserTab] = useState<string>('delivery_person');
  // Password reset modal
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  // Reassign modals
  const [reassignPersonModalVisible, setReassignPersonModalVisible] = useState(false);
  const [reassignOperatorModalVisible, setReassignOperatorModalVisible] = useState(false);
  const [reassignReturnDelivererModalVisible, setReassignReturnDelivererModalVisible] = useState(false);
  const [selectedReassignPersonId, setSelectedReassignPersonId] = useState<string>('');
  const [selectedReassignOperatorId, setSelectedReassignOperatorId] = useState<string>('');
  const [selectedReassignReturnDelivererId, setSelectedReassignReturnDelivererId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  // Reject modals
  const [rejectAssignmentModalVisible, setRejectAssignmentModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectAssignmentType, setRejectAssignmentType] = useState<'deliverer' | 'warehouse_operator' | 'return_deliverer'>('deliverer');
  const [selectedRejectEntity, setSelectedRejectEntity] = useState<IDelivery | IReturn | null>(null);

  useEffect(() => {
    loadDeliveries();
    loadReturns();
    loadDeliveryPersons();
    loadWarehouseOperators();
    loadChildUsers();
  }, []);

  useEffect(() => {
    loadChildUsers();
  }, [userTab]);

  // Reload when tab changes
  useEffect(() => {
    if (activeTab === 'delivery') {
      loadDeliveries();
    } else if (activeTab === 'return') {
      loadReturns();
    }
  }, [activeTab]);

  // Load return by ID if returnId is in URL
  const loadReturnById = async (returnId: string) => {
    try {
      const { getReturnRequestApi } = await import('@/services/endPoints/return');
      const { data } = await getReturnRequestApi(returnId);
      if (data.returnRequest) {
        // Add to returns list if not already there
        setReturns(prev => {
          if (!prev.find(r => String(r._id) === returnId)) {
            return [data.returnRequest, ...prev];
          }
          return prev;
        });
        // Switch to return tab
        setActiveTab('return');
        // Auto-open assign modal if return is ready for deliverer assignment
        if (data.returnRequest.returnStatus === 'assigned_agency' || data.returnRequest.returnStatus === 're_delivery') {
          handleAssignReturnDeliverer(data.returnRequest);
        }
      }
    } catch (error: any) {
      console.error('Failed to load return details:', error);
      message.error(error?.response?.data?.message || 'Failed to load return details');
    }
  };

  // Handle URL params for notification navigation
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const orderItemId = searchParams.get('orderItemId');
    const productId = searchParams.get('productId');
    const returnId = searchParams.get('returnId');
    
    if (returnId) {
      // First try to find in loaded returns
      const returnRequest = returns.find((r) => String(r._id) === returnId);
      if (returnRequest) {
        // Switch to return tab and find the return
        setActiveTab('return');
        if (returnRequest.returnStatus === 'assigned_agency' || returnRequest.returnStatus === 're_delivery') {
          // Auto-open assign modal if return is ready for deliverer assignment
          handleAssignReturnDeliverer(returnRequest);
        }
      } else {
        // If not found in loaded returns, load it directly
        loadReturnById(returnId);
      }
    } else if (orderId && deliveries.length > 0) {
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
  }, [searchParams, deliveries, returns]);

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

  const loadWarehouseOperators = async () => {
    try {
      setLoadingWarehouseOperators(true);
      const { data } = await getWarehouseOperatorsApi();
      setWarehouseOperators(data.warehouseOperators || []);
    } catch (error: any) {
      console.error('Failed to load warehouse operators:', error);
      message.error(error?.response?.data?.message || 'Failed to load warehouse operators');
    } finally {
      setLoadingWarehouseOperators(false);
    }
  };

  const loadReturns = async () => {
    try {
      setLoadingReturns(true);
      const { data } = await getAgencyReturnsApi();
      setReturns(data.returns || []);
    } catch (error: any) {
      console.error('Failed to load returns:', error);
      message.error(error?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoadingReturns(false);
    }
  };

  const handleAssignReturnDeliverer = async (returnRequest: IReturn) => {
    setSelectedReturnId(returnRequest._id);
    setAssignReturnDelivererModalVisible(true);
    await loadDeliveryPersons(); // Reload to get customer_return deliverers
  };

  const handleConfirmReturnDelivererAssignment = async () => {
    if (!selectedReturnId || !selectedReturnDelivererId) {
      message.error('Please select a return deliverer');
      return;
    }

    try {
      setAssigningReturnDeliverer(true);
      await assignReturnDelivererApi(selectedReturnId, selectedReturnDelivererId);
      message.success('Return deliverer assigned successfully');
      setAssignReturnDelivererModalVisible(false);
      setSelectedReturnId(null);
      setSelectedReturnDelivererId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign return deliverer');
    } finally {
      setAssigningReturnDeliverer(false);
    }
  };

  const getReturnStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'default',
      assigned_support: 'blue',
      assigned_agency: 'cyan',
      assigned_deliverer: 'geekblue',
      picked_up: 'processing',
      submitted_to_support: 'success',
      in_inspection: 'magenta',
      inspector_assigned: 'volcano',
      inspection_accepted: 'success',
      inspection_rejected: 'error',
      refund_processing: 'warning',
      refunded: 'success',
      re_delivery: 'orange',
      completed: 'success',
      cancelled: 'default',
    };
    return statusColors[status] || 'default';
  };

  const getReturnStatusLabel = (status: string) => {
    return status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  const loadChildUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await getUsersApi({ role: userTab });
      setChildUsers(data.users || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetPassword = (user: any) => {
    setSelectedUserId(user._id);
    setSelectedUserName(user.fullName || user.email);
    setResetPasswordModalVisible(true);
    resetPasswordForm.resetFields();
  };

  const handleConfirmResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!selectedUserId) return;
    
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    try {
      setResettingPassword(true);
      await resetPasswordAdminApi({
        userId: selectedUserId,
        newPassword: values.newPassword,
      });
      message.success('Password reset successfully');
      setResetPasswordModalVisible(false);
      resetPasswordForm.resetFields();
      setSelectedUserId(null);
      setSelectedUserName('');
      loadChildUsers(); // Reload users after password reset
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  // Reassign handlers
  const handleReassignPerson = (delivery: IDelivery, delivererType: 'warehouse' | 'customer_delivery') => {
    setSelectedDelivery(delivery);
    setSelectedDelivererType(delivererType);
    setReassignPersonModalVisible(true);
    setReassignReason('');
    setSelectedReassignPersonId('');
    loadDeliveryPersons();
  };

  const handleReassignOperator = (delivery: IDelivery) => {
    setSelectedDelivery(delivery);
    setReassignOperatorModalVisible(true);
    setReassignReason('');
    setSelectedReassignOperatorId('');
    loadWarehouseOperators();
  };

  const handleReassignReturnDeliverer = (returnRequest: IReturn) => {
    setSelectedReturnId(returnRequest._id);
    setReassignReturnDelivererModalVisible(true);
    setReassignReason('');
    setSelectedReassignReturnDelivererId('');
    loadDeliveryPersons();
  };

  const handleConfirmReassignPerson = async () => {
    if (!selectedDelivery || !selectedReassignPersonId) {
      message.error('Please select a delivery person');
      return;
    }

    try {
      setReassigning(true);
      const orderItemId = selectedDelivery.orderItemId;
      const productId = selectedDelivery.productId?._id || selectedDelivery.productId;
      await reassignDeliveryPersonApi(
        selectedDelivery.orderId._id,
        selectedReassignPersonId,
        orderItemId,
        productId,
        reassignReason
      );
      message.success('Delivery person reassigned successfully');
      setReassignPersonModalVisible(false);
      setSelectedReassignPersonId('');
      setReassignReason('');
      setSelectedDelivery(null);
      await loadDeliveries();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reassign delivery person');
    } finally {
      setReassigning(false);
    }
  };

  const handleConfirmReassignOperator = async () => {
    if (!selectedDelivery || !selectedReassignOperatorId) {
      message.error('Please select a warehouse operator');
      return;
    }

    try {
      setReassigning(true);
      const orderItemId = selectedDelivery.orderItemId;
      const productId = selectedDelivery.productId?._id || selectedDelivery.productId;
      await reassignWarehouseOperatorApi(
        selectedDelivery.orderId._id,
        selectedReassignOperatorId,
        orderItemId,
        productId,
        reassignReason
      );
      message.success('Warehouse operator reassigned successfully');
      setReassignOperatorModalVisible(false);
      setSelectedReassignOperatorId('');
      setReassignReason('');
      setSelectedDelivery(null);
      await loadDeliveries();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reassign warehouse operator');
    } finally {
      setReassigning(false);
    }
  };

  const handleConfirmReassignReturnDeliverer = async () => {
    if (!selectedReturnId || !selectedReassignReturnDelivererId) {
      message.error('Please select a return deliverer');
      return;
    }

    try {
      setReassigning(true);
      await reassignReturnDelivererApi(selectedReturnId, selectedReassignReturnDelivererId, reassignReason);
      message.success('Return deliverer reassigned successfully');
      setReassignReturnDelivererModalVisible(false);
      setSelectedReassignReturnDelivererId('');
      setReassignReason('');
      setSelectedReturnId(null);
      await loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reassign return deliverer');
    } finally {
      setReassigning(false);
    }
  };

  // Reject handlers
  const handleRejectAssignment = (entity: IDelivery | IReturn, assignmentType: 'deliverer' | 'warehouse_operator' | 'return_deliverer') => {
    setSelectedRejectEntity(entity);
    setRejectAssignmentType(assignmentType);
    setRejectAssignmentModalVisible(true);
    setRejectReason('');
  };

  const handleConfirmRejectAssignment = async () => {
    if (!selectedRejectEntity || !rejectReason || rejectReason.trim().length === 0) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(true);
      if ('orderId' in selectedRejectEntity && 'status' in selectedRejectEntity) {
        // It's a delivery
        const delivery = selectedRejectEntity as IDelivery;
        const orderItemId = delivery.orderItemId;
        const productId = delivery.productId?._id || delivery.productId;
        await rejectDeliveryAssignmentApi(
          delivery.orderId._id,
          rejectReason,
          rejectAssignmentType as 'deliverer' | 'warehouse_operator',
          orderItemId,
          productId
        );
        message.success('Assignment rejected successfully');
        await loadDeliveries();
      } else {
        // It's a return
        const returnRequest = selectedRejectEntity as IReturn;
        await rejectReturnAssignmentApi(returnRequest._id, rejectReason, rejectAssignmentType as 'deliverer');
        message.success('Assignment rejected successfully');
        await loadReturns();
      }
      setRejectAssignmentModalVisible(false);
      setRejectReason('');
      setSelectedRejectEntity(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reject assignment');
    } finally {
      setRejecting(false);
    }
  };

  const handleAssignWarehouseOperator = async (delivery: IDelivery) => {
    setAssigningToDeliveryId(delivery._id);
    setAssignWarehouseOperatorModalVisible(true);
    await loadWarehouseOperators();
  };

  const handleConfirmWarehouseOperatorAssignment = async () => {
    if (!selectedWarehouseOperatorId || !assigningToDeliveryId) {
      message.error('Please select a warehouse operator');
      return;
    }

    try {
      setAssigningWarehouseOperator(true);
      const delivery = deliveries.find(d => d._id === assigningToDeliveryId);
      if (!delivery) {
        message.error('Delivery not found');
        return;
      }

      // Pass orderItemId and productId for per-item assignment
      const orderItemId = delivery.orderItemId;
      const productId = delivery.productId?._id || delivery.productId;
      await assignWarehouseOperatorApi(delivery.orderId._id, selectedWarehouseOperatorId, orderItemId, productId);
      message.success('Warehouse operator assigned successfully');
      setAssignWarehouseOperatorModalVisible(false);
      setSelectedWarehouseOperatorId('');
      setAssigningToDeliveryId(null);
      await loadDeliveries();
    } catch (error: any) {
      console.error('Failed to assign warehouse operator:', error);
      message.error(error?.response?.data?.message || 'Failed to assign warehouse operator');
    } finally {
      setAssigningWarehouseOperator(false);
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

  const handleAssignPerson = (delivery: IDelivery, delivererType: 'warehouse' | 'customer_delivery' | 'customer_return') => {
    setAssigningToDeliveryId(delivery._id);
    setAssignModalVisible(true);
    setSelectedDelivererType(delivererType);
    loadDeliveryPersons();
  };

  const handleConfirmAssignment = async () => {
    if (!selectedPersonId || !assigningToDeliveryId) {
      message.error('Please select a delivery person');
      return;
    }

    // Verify selected person matches the required deliverer type
    const selectedPerson = deliveryPersons.find(p => p._id === selectedPersonId);
    if (selectedPerson?.delivererType !== selectedDelivererType) {
      message.error(`Please select a ${selectedDelivererType} deliverer`);
      return;
    }

    try {
      setAssigning(true);
      const delivery = deliveries.find(d => d._id === assigningToDeliveryId);
      if (!delivery) {
        message.error('Delivery not found');
        return;
      }

      // Pass orderItemId and productId for per-item assignment
      const orderItemId = delivery.orderItemId;
      const productId = delivery.productId?._id || delivery.productId;
      await assignToDeliveryPersonApi(delivery.orderId._id, selectedPersonId, orderItemId, productId);
      message.success('Delivery assigned to person successfully');
      setAssignModalVisible(false);
      setSelectedPersonId('');
      setAssigningToDeliveryId(null);
      setSelectedDelivererType('warehouse');
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
      
      if (createUserType === 'warehouse_operator') {
        // Create warehouse operator using createUserApi
        await createUserApi({
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          phone: values.phone,
          role: 'warehouse_operator',
        });
        message.success('Warehouse operator created successfully');
        await loadWarehouseOperators();
      } else {
        // Create delivery person using createDeliveryPersonApi
        await createDeliveryPersonApi(values.email, values.password, values.fullName, values.delivererType, values.phone);
        message.success('Delivery person created successfully');
        await loadDeliveryPersons();
      }
      
      setCreatePersonModalVisible(false);
      createPersonForm.resetFields();
      loadChildUsers(); // Reload child users list
    } catch (error: any) {
      console.error(`Failed to create ${createUserType}:`, error);
      message.error(error?.response?.data?.message || `Failed to create ${createUserType}`);
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
          <Space>
            <Button type="primary" onClick={() => {
              setCreateUserType('delivery_person');
              setCreatePersonModalVisible(true);
            }}>
              Add Deliverer
            </Button>
            <Button type="default" onClick={() => {
              setCreateUserType('warehouse_operator');
              setCreatePersonModalVisible(true);
            }}>
              Add Warehouse Operator
            </Button>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'workload',
              label: (
                <span>
                  <UserOutlined /> Workload Dashboard
                </span>
              ),
              children: (
                <WorkloadDashboard />
              ),
            },
            {
              key: 'delivery',
              label: (
                <span>
                  <ShoppingOutlined /> Customer Delivery ({deliveries.length})
                </span>
              ),
              children: (
                <Spin spinning={loading}>
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
                      {delivery.status === 'ready_to_ship' && (
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={() => handleAssignPerson(delivery, 'warehouse')}
                          disabled={!!(delivery.assignedDeliveryPerson && delivery.assignedDeliveryPerson?.delivererType === 'warehouse')}
                        >
                          {delivery.assignedDeliveryPerson?.delivererType === 'warehouse' ? 'Warehouse Assigned' : 'Assign Warehouse Deliverer'}
                        </Button>
                      )}
                      {delivery.status === 'in_facility' && (
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={() => handleAssignWarehouseOperator(delivery)}
                          disabled={!!delivery.assignedWarehouseOperator}
                        >
                          {delivery.assignedWarehouseOperator ? 'Warehouse Operator Assigned' : 'Assign Warehouse Operator'}
                        </Button>
                      )}
                      {(delivery.status === 'in_transit' || delivery.status === 'out_for_delivery') && (
                        <>
                          <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => handleAssignPerson(delivery, 'customer_delivery')}
                            disabled={!!(delivery.assignedDeliveryPerson && delivery.assignedDeliveryPerson?.delivererType === 'customer_delivery')}
                          >
                            {delivery.assignedDeliveryPerson?.delivererType === 'customer_delivery' ? 'Customer Deliverer Assigned' : 'Assign Customer Deliverer'}
                          </Button>
                          {delivery.assignedDeliveryPerson?.delivererType === 'customer_delivery' && (
                            <>
                              <Button
                                icon={<SwapOutlined />}
                                onClick={() => handleReassignPerson(delivery, 'customer_delivery')}
                              >
                                Reassign
                              </Button>
                              <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleRejectAssignment(delivery, 'deliverer')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {delivery.status === 'in_facility' && delivery.assignedWarehouseOperator && (
                        <>
                          <Button
                            icon={<SwapOutlined />}
                            onClick={() => handleReassignOperator(delivery)}
                          >
                            Reassign Operator
                          </Button>
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleRejectAssignment(delivery, 'warehouse_operator')}
                          >
                            Reject Operator
                          </Button>
                        </>
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
                    {delivery.assignedWarehouseOperator && (
                      <div>
                        <Text strong>Warehouse Operator: </Text>
                        <Text>
                          {delivery.assignedWarehouseOperator.fullName || delivery.assignedWarehouseOperator.email || 'Assigned'}
                        </Text>
                      </div>
                    )}
                    {delivery.assignedDeliveryPerson && (
                      <div>
                        <Text strong>Assigned Deliverer: </Text>
                        <Text>
                          {delivery.assignedDeliveryPerson.fullName || delivery.assignedDeliveryPerson.email} ({delivery.assignedDeliveryPerson.delivererType || 'N/A'})
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
                </Spin>
              ),
            },
            {
              key: 'return',
              label: (
                <span>
                  <UndoOutlined /> Customer Return ({returns.length})
                </span>
              ),
              children: (
                <Spin spinning={loadingReturns}>
                  {returns.length === 0 ? (
                    <Empty description="No returns assigned to your agency" />
                  ) : (
                    <List
                      dataSource={returns}
                      renderItem={(returnRequest) => (
                        <List.Item>
                          <Card
                            style={{ width: '100%' }}
                            title={
                              <Space>
                                <Text strong>Return #{returnRequest._id.slice(-8)}</Text>
                                <Tag color={getReturnStatusColor(returnRequest.returnStatus)}>
                                  {getReturnStatusLabel(returnRequest.returnStatus)}
                                </Tag>
                              </Space>
                            }
                            extra={
                              <Space>
                                {(returnRequest.returnStatus === 'assigned_agency' || returnRequest.returnStatus === 're_delivery') && (
                                  <>
                                    <Button
                                      type="primary"
                                      icon={<UserAddOutlined />}
                                      onClick={() => handleAssignReturnDeliverer(returnRequest)}
                                      disabled={!!returnRequest.assignedReturnDeliverer}
                                    >
                                      {returnRequest.assignedReturnDeliverer ? 'Return Deliverer Assigned' : 'Assign Return Deliverer'}
                                    </Button>
                                    {returnRequest.assignedReturnDeliverer && (
                                      <>
                                        <Button
                                          icon={<SwapOutlined />}
                                          onClick={() => handleReassignReturnDeliverer(returnRequest)}
                                        >
                                          Reassign
                                        </Button>
                                        <Button
                                          danger
                                          icon={<CloseCircleOutlined />}
                                          onClick={() => handleRejectAssignment(returnRequest, 'return_deliverer')}
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </Space>
                            }
                          >
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                              <div>
                                <Text strong>Order: </Text>
                                <Text>#{returnRequest.orderId._id.toString().slice(-8)}</Text>
                              </div>
                              <div>
                                <Text strong>Customer: </Text>
                                <Text>{returnRequest.userId.fullName || returnRequest.userId.email}</Text>
                              </div>
                              <div>
                                <Text strong>Return Amount: </Text>
                                <Text>${(returnRequest.returnAmount / 100).toFixed(2)}</Text>
                              </div>
                              <div>
                                <Text strong>Reason: </Text>
                                <Text>{returnRequest.reason}</Text>
                              </div>
                              {returnRequest.assignedReturnDeliverer && (
                                <div>
                                  <Text strong>Return Deliverer: </Text>
                                  <Text>
                                    {returnRequest.assignedReturnDeliverer.fullName || returnRequest.assignedReturnDeliverer.email}
                                  </Text>
                                </div>
                              )}
                              {returnRequest.pickedUpAt && (
                                <div>
                                  <Text strong>Picked Up At: </Text>
                                  <Text>{new Date(returnRequest.pickedUpAt).toLocaleString()}</Text>
                                </div>
                              )}
                            </Space>
                          </Card>
                        </List.Item>
                      )}
                    />
                  )}
                </Spin>
              ),
            },
          ]}
        />
      </Card>

      {/* User Management Section */}
      <Card style={{ marginTop: 16 }}>
        <Tabs
          activeKey={userTab}
          onChange={(key) => setUserTab(key)}
          items={[
            {
              key: 'delivery_person',
              label: `Delivery Persons (${childUsers.length})`,
              children: (
                <List
                  dataSource={childUsers}
                  loading={loadingUsers}
                  renderItem={(user: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={user.fullName}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{user.email}</Text>
                            {user.phone && <Text type="secondary">Phone: {user.phone}</Text>}
                            {user.delivererType && (
                              <Text type="secondary">Type: {user.delivererType}</Text>
                            )}
                          </Space>
                        }
                      />
                      <Space>
                        <Tag color="blue">Delivery Person</Tag>
                        {user.delivererType && (
                          <Tag color="cyan">{user.delivererType}</Tag>
                        )}
                        <Button
                          type="link"
                          icon={<LockOutlined />}
                          onClick={() => handleResetPassword(user)}
                          size="small"
                        >
                          Reset Password
                        </Button>
                      </Space>
                    </List.Item>
                  )}
                  locale={{ emptyText: <Empty description="No delivery persons found" /> }}
                />
              ),
            },
            {
              key: 'warehouse_operator',
              label: `Warehouse Operators (${childUsers.length})`,
              children: (
                <List
                  dataSource={childUsers}
                  loading={loadingUsers}
                  renderItem={(user: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={user.fullName}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{user.email}</Text>
                            {user.phone && <Text type="secondary">Phone: {user.phone}</Text>}
                          </Space>
                        }
                      />
                      <Space>
                        <Tag color="green">Warehouse Operator</Tag>
                        <Button
                          type="link"
                          icon={<LockOutlined />}
                          onClick={() => handleResetPassword(user)}
                          size="small"
                        >
                          Reset Password
                        </Button>
                      </Space>
                    </List.Item>
                  )}
                  locale={{ emptyText: <Empty description="No warehouse operators found" /> }}
                />
              ),
            },
          ]}
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

      {/* Assign Person Modal */}
      <Modal
        title={`Assign ${selectedDelivererType === 'warehouse' ? 'Warehouse' : 'Customer'} Deliverer`}
        open={assignModalVisible}
        onOk={handleConfirmAssignment}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedPersonId('');
          setAssigningToDeliveryId(null);
          setSelectedDelivererType('warehouse');
        }}
        okText="Assign"
        okButtonProps={{ loading: assigning }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Deliverer Type:</Text>
            <Tag color={selectedDelivererType === 'warehouse' ? 'blue' : 'green'} style={{ marginLeft: 8 }}>
              {selectedDelivererType === 'warehouse' ? 'Warehouse Deliverer' : 'Customer Deliverer'}
            </Tag>
          </div>
          <div>
            <Text strong>Select Delivery Person ({selectedDelivererType}):</Text>
          </div>
          {loadingPersons ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder={`Select a ${selectedDelivererType} deliverer`}
              value={selectedPersonId}
              onChange={setSelectedPersonId}
              options={deliveryPersons
                .filter((person) => person.delivererType === selectedDelivererType)
                .map((person) => ({
                  value: person._id,
                  label: `${person.fullName || person.email} (${person.phone || 'No phone'}) - ${person.delivererType}`,
                }))}
            />
          )}
          {deliveryPersons.filter(p => p.delivererType === selectedDelivererType).length === 0 && !loadingPersons && (
            <Text type="secondary">No {selectedDelivererType} deliverers available</Text>
          )}
        </Space>
      </Modal>

      {/* Assign Warehouse Operator Modal */}
      <Modal
        title="Assign Warehouse Operator"
        open={assignWarehouseOperatorModalVisible}
        onOk={handleConfirmWarehouseOperatorAssignment}
        onCancel={() => {
          setAssignWarehouseOperatorModalVisible(false);
          setSelectedWarehouseOperatorId('');
          setAssigningToDeliveryId(null);
        }}
        okText="Assign"
        okButtonProps={{ loading: assigningWarehouseOperator }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select Warehouse Operator:</Text>
          </div>
          {loadingWarehouseOperators ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder="Select a warehouse operator"
              value={selectedWarehouseOperatorId}
              onChange={setSelectedWarehouseOperatorId}
              options={warehouseOperators.map((operator) => ({
                value: operator._id,
                label: `${operator.fullName || operator.email} (${operator.phone || 'No phone'})`,
              }))}
            />
          )}
          {warehouseOperators.length === 0 && !loadingWarehouseOperators && (
            <Text type="secondary">No warehouse operators available</Text>
          )}
        </Space>
      </Modal>

      {/* Create User Modal (Delivery Person or Warehouse Operator) */}
      <Modal
        title={createUserType === 'warehouse_operator' ? 'Add Warehouse Operator' : 'Add Deliverer'}
        open={createPersonModalVisible}
        onOk={() => createPersonForm.submit()}
        onCancel={() => {
          setCreatePersonModalVisible(false);
          createPersonForm.resetFields();
          setCreateUserType('delivery_person'); // Reset to default
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
          {createUserType === 'delivery_person' && (
            <Form.Item
              name="delivererType"
              label="Deliverer Type"
              rules={[{ required: true, message: 'Please select deliverer type' }]}
            >
              <Radio.Group>
                <Radio value="warehouse">Warehouse Deliverer</Radio>
                <Radio value="customer_delivery">Customer Delivery Deliverer</Radio>
                <Radio value="customer_return">Customer Return Deliverer</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Assign Return Deliverer Modal */}
      <Modal
        title="Assign Return Deliverer"
        open={assignReturnDelivererModalVisible}
        onOk={handleConfirmReturnDelivererAssignment}
        onCancel={() => {
          setAssignReturnDelivererModalVisible(false);
          setSelectedReturnId(null);
          setSelectedReturnDelivererId('');
        }}
        okText="Assign"
        okButtonProps={{ loading: assigningReturnDeliverer }}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select Return Deliverer (customer_return):</Text>
          </div>
          {loadingPersons ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder="Select a return deliverer (customer_return type)"
              value={selectedReturnDelivererId}
              onChange={setSelectedReturnDelivererId}
              options={deliveryPersons
                .filter((person) => person.delivererType === 'customer_return')
                .map((person) => ({
                  value: person._id,
                  label: `${person.fullName || person.email} (${person.phone || 'No phone'}) - ${person.delivererType}`,
                }))}
            />
          )}
          {deliveryPersons.filter(p => p.delivererType === 'customer_return').length === 0 && !loadingPersons && (
            <Text type="secondary">No customer_return deliverers available. Please create one first.</Text>
          )}
        </Space>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={`Reset Password for ${selectedUserName}`}
        open={resetPasswordModalVisible}
        onOk={() => resetPasswordForm.submit()}
        onCancel={() => {
          setResetPasswordModalVisible(false);
          resetPasswordForm.resetFields();
          setSelectedUserId(null);
          setSelectedUserName('');
        }}
        okText="Reset Password"
        okButtonProps={{ loading: resettingPassword }}
        width={500}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleConfirmResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm the new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reassign Person Modal */}
      <Modal
        title={`Reassign ${selectedDelivererType === 'warehouse' ? 'Warehouse' : 'Customer'} Deliverer`}
        open={reassignPersonModalVisible}
        onOk={handleConfirmReassignPerson}
        onCancel={() => {
          setReassignPersonModalVisible(false);
          setSelectedReassignPersonId('');
          setReassignReason('');
          setSelectedDelivery(null);
        }}
        okText="Reassign"
        okButtonProps={{ loading: reassigning }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select New Delivery Person ({selectedDelivererType}):</Text>
          </div>
          {loadingPersons ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder={`Select a ${selectedDelivererType} deliverer`}
              value={selectedReassignPersonId}
              onChange={setSelectedReassignPersonId}
              options={deliveryPersons
                .filter((person) => person.delivererType === selectedDelivererType)
                .map((person) => ({
                  value: person._id,
                  label: `${person.fullName || person.email} (${person.phone || 'No phone'}) - ${person.delivererType}`,
                }))}
            />
          )}
          <div>
            <Text strong>Reason for Reassignment (Optional):</Text>
            <TextArea
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Enter reason for reassignment..."
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Reassign Warehouse Operator Modal */}
      <Modal
        title="Reassign Warehouse Operator"
        open={reassignOperatorModalVisible}
        onOk={handleConfirmReassignOperator}
        onCancel={() => {
          setReassignOperatorModalVisible(false);
          setSelectedReassignOperatorId('');
          setReassignReason('');
          setSelectedDelivery(null);
        }}
        okText="Reassign"
        okButtonProps={{ loading: reassigning }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select New Warehouse Operator:</Text>
          </div>
          {loadingWarehouseOperators ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder="Select a warehouse operator"
              value={selectedReassignOperatorId}
              onChange={setSelectedReassignOperatorId}
              options={warehouseOperators.map((operator) => ({
                value: operator._id,
                label: `${operator.fullName || operator.email} (${operator.phone || 'No phone'})`,
              }))}
            />
          )}
          <div>
            <Text strong>Reason for Reassignment (Optional):</Text>
            <TextArea
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Enter reason for reassignment..."
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Reassign Return Deliverer Modal */}
      <Modal
        title="Reassign Return Deliverer"
        open={reassignReturnDelivererModalVisible}
        onOk={handleConfirmReassignReturnDeliverer}
        onCancel={() => {
          setReassignReturnDelivererModalVisible(false);
          setSelectedReassignReturnDelivererId('');
          setReassignReason('');
          setSelectedReturnId(null);
        }}
        okText="Reassign"
        okButtonProps={{ loading: reassigning }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select New Return Deliverer (customer_return):</Text>
          </div>
          {loadingPersons ? (
            <Spin />
          ) : (
            <Select
              style={{ width: '100%' }}
              placeholder="Select a return deliverer (customer_return type)"
              value={selectedReassignReturnDelivererId}
              onChange={setSelectedReassignReturnDelivererId}
              options={deliveryPersons
                .filter((person) => person.delivererType === 'customer_return')
                .map((person) => ({
                  value: person._id,
                  label: `${person.fullName || person.email} (${person.phone || 'No phone'}) - ${person.delivererType}`,
                }))}
            />
          )}
          <div>
            <Text strong>Reason for Reassignment (Optional):</Text>
            <TextArea
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Enter reason for reassignment..."
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Reject Assignment Modal */}
      <Modal
        title="Reject Assignment"
        open={rejectAssignmentModalVisible}
        onOk={handleConfirmRejectAssignment}
        onCancel={() => {
          setRejectAssignmentModalVisible(false);
          setRejectReason('');
          setSelectedRejectEntity(null);
        }}
        okText="Reject Assignment"
        okButtonProps={{ loading: rejecting, danger: true }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text type="warning">Are you sure you want to reject this assignment? The assignment will be removed and the admin will be notified.</Text>
          </div>
          <div>
            <Text strong>Reason for Rejection <Text type="danger">*</Text>:</Text>
            <TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this assignment..."
              style={{ marginTop: 8 }}
              required
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default DeliveryAgencyDashboard;
