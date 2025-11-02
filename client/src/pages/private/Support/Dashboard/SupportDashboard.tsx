import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal, Select, Form, Input, Tabs } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  UserAddOutlined,
  CarOutlined,
  EyeOutlined,
  LockOutlined,
  SwapOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import { 
  getSupportReturnsApi,
  assignSupportUserApi,
  assignReturnDeliveryAgencyApi,
  assignVerificationTeamApi,
  assignFinanceApi,
  assignRedeliveryAgencyApi,
  getReturnRequestApi,
} from 'services/endPoints/return';
import {
  reassignSupportUserApi,
  reassignReturnDeliveryAgencyApi,
  reassignVerificationTeamApi,
  reassignFinanceApi,
  reassignInspectorApi,
  rejectReturnAssignmentApi,
} from 'services/endPoints/return/returnWorkflowEndpoints';
import { createUserApi, resetPasswordAdminApi, getUsersApi } from 'services/endPoints/user/userListEndpoints';
import { WorkloadDashboard } from 'components';
import './SupportDashboard.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IReturn {
  _id: string;
  orderId: {
    _id: string;
    userId: any;
    items: any[];
    amount: number;
  };
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  items: any[];
  returnAmount: number;
  reason: string;
  proofImages?: string[];
  returnStatus: string;
  assignedSupportUser?: any;
  assignedDeliveryAgency?: any;
  assignedVerificationTeam?: any;
  assignedInspector?: any;
  assignedFinance?: any;
  inspectionResult?: string;
  inspectionRejectionReason?: string;
  createdAt: Date;
  statusHistory: any[];
}

const SupportDashboard = () => {
  const auth = useAuth();
  const userRole = auth?.result?.role;
  const isSupportUser = userRole === 'support_user';
  const isSupport = userRole === 'support';
  const [searchParams] = useSearchParams();
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<IReturn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Assignment modals
  const [assignSupportModalVisible, setAssignSupportModalVisible] = useState(false);
  const [assignAgencyModalVisible, setAssignAgencyModalVisible] = useState(false);
  const [assignVerificationModalVisible, setAssignVerificationModalVisible] = useState(false);
  const [assignFinanceModalVisible, setAssignFinanceModalVisible] = useState(false);
  const [assignRedeliveryModalVisible, setAssignRedeliveryModalVisible] = useState(false);
  
  // Assignment data
  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [deliveryAgencies, setDeliveryAgencies] = useState<any[]>([]);
  const [verificationTeams, setVerificationTeams] = useState<any[]>([]);
  const [financeUsers, setFinanceUsers] = useState<any[]>([]);
  const [selectedSupportUserId, setSelectedSupportUserId] = useState<string>('');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [selectedVerificationTeamId, setSelectedVerificationTeamId] = useState<string>('');
  const [selectedFinanceId, setSelectedFinanceId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  // Create user modal
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [createUserForm] = Form.useForm();
  const [creatingUser, setCreatingUser] = useState(false);
  // Password reset modal
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  // User management
  const [childUsers, setChildUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userTab, setUserTab] = useState<string>('support_user');
  // Reassign/reject modals
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [reassignType, setReassignType] = useState<'support' | 'agency' | 'verification' | 'finance'>('support');
  const [selectedReassignId, setSelectedReassignId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [rejectAssignmentModalVisible, setRejectAssignmentModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectAssignmentType, setRejectAssignmentType] = useState<'support' | 'agency' | 'verification' | 'finance'>('support');

  useEffect(() => {
    loadReturns();
    loadSupportUsers();
    loadDeliveryAgencies();
    loadVerificationTeams();
    loadFinanceUsers();
    if (isSupport) {
      loadChildUsers();
    }
  }, []);

  useEffect(() => {
    if (isSupport) {
      loadChildUsers();
    }
  }, [userTab, isSupport]);

  const loadReturnById = async (returnId: string) => {
    try {
      const { data } = await getReturnRequestApi(returnId);
      if (data.returnRequest) {
        setSelectedReturn(data.returnRequest);
        setDetailModalVisible(true);
        // Add to returns list if not already there
        setReturns(prev => {
          if (!prev.find(r => String(r._id) === returnId)) {
            return [data.returnRequest, ...prev];
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error('Failed to load return details:', error);
      message.error(error?.response?.data?.message || 'Failed to load return details');
    }
  };

  // Handle URL params for notification navigation
  useEffect(() => {
    const returnId = searchParams.get('returnId');
    if (returnId) {
      // First try to find in loaded returns
      const returnRequest = returns.find(r => String(r._id) === returnId);
      if (returnRequest) {
        handleViewDetails(returnRequest);
      } else {
        // If not found in loaded returns, load it directly
        loadReturnById(returnId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const { data } = await getSupportReturnsApi();
      setReturns(data.returns || []);
    } catch (error: any) {
      console.error('Failed to load returns:', error);
      message.error(error?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const loadSupportUsers = async () => {
    try {
      const { getUsersApi } = await import('services/endPoints/user/userListEndpoints');
      const { data } = await getUsersApi({ role: 'support_user' });
      setSupportUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load support users:', error);
    }
  };

  const loadDeliveryAgencies = async () => {
    try {
      const { getUsersApi } = await import('services/endPoints/user/userListEndpoints');
      const { data } = await getUsersApi({ role: 'delivery_agency' });
      setDeliveryAgencies(data.users || []);
    } catch (error) {
      console.error('Failed to load delivery agencies:', error);
    }
  };

  const loadVerificationTeams = async () => {
    try {
      const { getUsersApi } = await import('services/endPoints/user/userListEndpoints');
      const { data } = await getUsersApi({ role: 'verification_team' });
      setVerificationTeams(data.users || []);
    } catch (error) {
      console.error('Failed to load verification teams:', error);
    }
  };

  const loadFinanceUsers = async () => {
    try {
      const { getUsersApi } = await import('services/endPoints/user/userListEndpoints');
      const { data } = await getUsersApi({ role: 'finance' });
      setFinanceUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load finance users:', error);
    }
  };

  const handleViewDetails = async (returnRequest: IReturn) => {
    try {
      setSelectedReturn(returnRequest);
      setDetailModalVisible(true);
      // Optionally reload to get latest status
      const { data } = await getReturnRequestApi(returnRequest._id);
      if (data.returnRequest) {
        setSelectedReturn(data.returnRequest);
      }
    } catch (error: any) {
      console.error('Failed to load return details:', error);
      message.error('Failed to load return details');
    }
  };

  const handleAssignSupport = async () => {
    if (!selectedReturn || !selectedSupportUserId) {
      message.warning('Please select a support user');
      return;
    }
    
    try {
      setAssigning(true);
      await assignSupportUserApi(selectedReturn._id, selectedSupportUserId);
      message.success('Support user assigned successfully');
      setAssignSupportModalVisible(false);
      setSelectedSupportUserId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign support user');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignAgency = async () => {
    if (!selectedReturn || !selectedAgencyId) {
      message.warning('Please select a delivery agency');
      return;
    }
    
    try {
      setAssigning(true);
      await assignReturnDeliveryAgencyApi(selectedReturn._id, selectedAgencyId);
      message.success('Delivery agency assigned successfully');
      setAssignAgencyModalVisible(false);
      setSelectedAgencyId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign delivery agency');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignVerification = async () => {
    if (!selectedReturn || !selectedVerificationTeamId) {
      message.warning('Please select a verification team');
      return;
    }
    
    try {
      setAssigning(true);
      await assignVerificationTeamApi(selectedReturn._id, selectedVerificationTeamId);
      message.success('Verification team assigned successfully');
      setAssignVerificationModalVisible(false);
      setSelectedVerificationTeamId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign verification team');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignFinance = async () => {
    if (!selectedReturn || !selectedFinanceId) {
      message.warning('Please select a finance user');
      return;
    }
    
    try {
      setAssigning(true);
      await assignFinanceApi(selectedReturn._id, selectedFinanceId);
      message.success('Finance user assigned successfully');
      setAssignFinanceModalVisible(false);
      setSelectedFinanceId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign finance user');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignRedelivery = async () => {
    if (!selectedReturn || !selectedAgencyId) {
      message.warning('Please select a delivery agency');
      return;
    }
    
    try {
      setAssigning(true);
      await assignRedeliveryAgencyApi(selectedReturn._id, selectedAgencyId);
      message.success('Re-delivery agency assigned successfully');
      setAssignRedeliveryModalVisible(false);
      setSelectedAgencyId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign re-delivery agency');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      setCreatingUser(true);
      await createUserApi({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        role: values.role,
      });
      message.success('User created successfully');
      setCreateUserModalVisible(false);
      createUserForm.resetFields();
      // Reload users based on role
      if (values.role === 'support_user') {
        loadSupportUsers();
      } else if (values.role === 'verification_team') {
        loadVerificationTeams();
      }
      loadChildUsers(); // Reload child users list
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleResetPassword = (user: any) => {
    setSelectedUserId(user._id);
    setSelectedUserName(user.fullName || user.email);
    setResetPasswordModalVisible(true);
    resetPasswordForm.resetFields();
  };

  const loadChildUsers = async () => {
    if (!isSupport) return;
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
  const handleReassign = (returnRequest: IReturn, reassignType: 'support' | 'agency' | 'verification' | 'finance') => {
    setSelectedReturn(returnRequest);
    setReassignType(reassignType);
    setReassignModalVisible(true);
    setSelectedReassignId('');
    setReassignReason('');
    
    // Load appropriate users list
    if (reassignType === 'support') {
      loadSupportUsers();
    } else if (reassignType === 'agency') {
      loadDeliveryAgencies();
    } else if (reassignType === 'verification') {
      loadVerificationTeams();
    } else if (reassignType === 'finance') {
      loadFinanceUsers();
    }
  };

  const handleConfirmReassign = async () => {
    if (!selectedReturn || !selectedReassignId) {
      message.error(`Please select a ${reassignType === 'support' ? 'support user' : reassignType === 'agency' ? 'delivery agency' : reassignType === 'verification' ? 'verification team' : 'finance user'}`);
      return;
    }

    try {
      setReassigning(true);
      if (reassignType === 'support') {
        await reassignSupportUserApi(selectedReturn._id, selectedReassignId, reassignReason);
      } else if (reassignType === 'agency') {
        await reassignReturnDeliveryAgencyApi(selectedReturn._id, selectedReassignId, reassignReason);
      } else if (reassignType === 'verification') {
        await reassignVerificationTeamApi(selectedReturn._id, selectedReassignId, reassignReason);
      } else if (reassignType === 'finance') {
        await reassignFinanceApi(selectedReturn._id, selectedReassignId, reassignReason);
      }
      message.success(`${reassignType === 'support' ? 'Support user' : reassignType === 'agency' ? 'Delivery agency' : reassignType === 'verification' ? 'Verification team' : 'Finance user'} reassigned successfully`);
      setReassignModalVisible(false);
      setSelectedReassignId('');
      setReassignReason('');
      setSelectedReturn(null);
      await loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reassign');
    } finally {
      setReassigning(false);
    }
  };

  // Reject handlers
  const handleRejectAssignment = (returnRequest: IReturn, assignmentType: 'support' | 'agency' | 'verification' | 'finance') => {
    setSelectedReturn(returnRequest);
    setRejectAssignmentType(assignmentType);
    setRejectAssignmentModalVisible(true);
    setRejectReason('');
  };

  const handleConfirmRejectAssignment = async () => {
    if (!selectedReturn || !rejectReason || rejectReason.trim().length === 0) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(true);
      await rejectReturnAssignmentApi(selectedReturn._id, rejectReason, rejectAssignmentType);
      message.success('Assignment rejected successfully');
      setRejectAssignmentModalVisible(false);
      setRejectReason('');
      setSelectedReturn(null);
      await loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reject assignment');
    } finally {
      setRejecting(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      pending: { color: 'orange', icon: <ClockCircleOutlined /> },
      assigned_support: { color: 'blue', icon: <UserAddOutlined /> },
      assigned_agency: { color: 'cyan', icon: <CarOutlined /> },
      assigned_deliverer: { color: 'geekblue', icon: <CarOutlined /> },
      picked_up: { color: 'processing', icon: <CarOutlined /> },
      submitted_to_support: { color: 'success', icon: <CheckCircleOutlined /> },
      in_inspection: { color: 'magenta', icon: <ClockCircleOutlined /> },
      inspector_assigned: { color: 'volcano', icon: <UserAddOutlined /> },
      inspection_accepted: { color: 'green', icon: <CheckCircleOutlined /> },
      inspection_rejected: { color: 'red', icon: <ClockCircleOutlined /> },
      refund_processing: { color: 'gold', icon: <ClockCircleOutlined /> },
      refunded: { color: 'success', icon: <CheckCircleOutlined /> },
      re_delivery: { color: 'warning', icon: <CarOutlined /> },
      completed: { color: 'success', icon: <CheckCircleOutlined /> },
    };
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
    <div className="support-dashboard">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Support Team Dashboard</Title>
            <Text type="secondary">
              Manage return requests. Assign support users, delivery agencies, verification teams, and finance users.
            </Text>
          </div>
          {isSupport && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setCreateUserModalVisible(true)}
            >
              Create User
            </Button>
          )}
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Return Requests ({returns.length})</Title>
        {returns.length === 0 ? (
          <Empty description="No return requests" />
        ) : (
          <List
            dataSource={returns}
            renderItem={(returnRequest) => {
              return (
                <List.Item
                  key={returnRequest._id}
                  actions={[
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(returnRequest)}
                    >
                      View Details
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>
                          Return #{returnRequest._id.slice(-8)}
                        </Text>
                        {getStatusTag(returnRequest.returnStatus)}
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          <Text>Order: #{returnRequest.orderId._id.toString().slice(-8)}</Text>
                        </div>
                        <div>
                          <Text>Customer: </Text>
                          <Text strong>{returnRequest.userId.fullName || returnRequest.userId.email}</Text>
                        </div>
                        <div>
                          <Text>Amount: </Text>
                          <Text strong>${(returnRequest.returnAmount / 100).toFixed(2)}</Text>
                        </div>
                        <div>
                          <Text>Reason: </Text>
                          <Text type="secondary">{returnRequest.reason}</Text>
                        </div>
                        {returnRequest.assignedSupportUser && (
                          <div>
                            <Text>Support User: </Text>
                            <Text strong>
                              {returnRequest.assignedSupportUser.fullName || returnRequest.assignedSupportUser.email}
                            </Text>
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

      {/* Workload Dashboard - Only visible to Support Admin */}
      {isSupport && (
        <Card style={{ marginTop: 16 }}>
          <WorkloadDashboard />
        </Card>
      )}

      {/* User Management Section - Only visible to Support Admin */}
      {isSupport && (
        <Card style={{ marginTop: 16 }}>
          <Tabs
            activeKey={userTab}
            onChange={(key) => setUserTab(key)}
            items={[
              {
                key: 'support_user',
                label: `Support Users (${childUsers.length})`,
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
                          <Tag color="blue">Support User</Tag>
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
                    locale={{ emptyText: <Empty description="No support users found" /> }}
                  />
                ),
              },
              {
                key: 'verification_team',
                label: `Verification Teams (${childUsers.length})`,
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
                          <Tag color="green">Verification Team</Tag>
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
                    locale={{ emptyText: <Empty description="No verification teams found" /> }}
                  />
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title="Return Request Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedReturn(null);
        }}
        footer={null}
        width={900}
      >
        {selectedReturn && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>Return ID: </Text>
                  <Text>{selectedReturn._id}</Text>
                </div>
                <div>
                  <Text strong>Order ID: </Text>
                  <Text>{selectedReturn.orderId._id}</Text>
                </div>
                <div>
                  <Text strong>Customer: </Text>
                  <Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}</Text>
                </div>
                <div>
                  <Text strong>Status: </Text>
                  {getStatusTag(selectedReturn.returnStatus)}
                </div>
                <div>
                  <Text strong>Return Amount: </Text>
                  <Text>${(selectedReturn.returnAmount / 100).toFixed(2)}</Text>
                </div>
                <div>
                  <Text strong>Reason: </Text>
                  <Text>{selectedReturn.reason}</Text>
                </div>
                
                {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                  <div>
                    <Text strong>Proof Images: </Text>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {selectedReturn.proofImages.map((image, index) => (
                        <img
                          key={index}
                          src={`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3010'}${image}`}
                          alt={`Proof ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Text strong>Items: </Text>
                  <List
                    size="small"
                    dataSource={selectedReturn.items}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Text>{item.title} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              </Space>
            </Card>

            {/* Action Buttons based on status */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {selectedReturn.returnStatus === 'pending' && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    setAssignSupportModalVisible(true);
                  }}
                  block
                >
                  Assign Support User
                </Button>
              )}

              {selectedReturn.returnStatus === 'assigned_support' && (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {isSupportUser && (
                    <Button
                      type="primary"
                      icon={<CarOutlined />}
                      onClick={() => {
                        setAssignAgencyModalVisible(true);
                      }}
                      block
                    >
                      Assign Delivery Agency (Return Pickup)
                    </Button>
                  )}
                  {(isSupport || isSupportUser) && selectedReturn.assignedSupportUser && (
                    <Space>
                      <Button
                        icon={<SwapOutlined />}
                        onClick={() => handleReassign(selectedReturn, 'support')}
                        block
                      >
                        Reassign Support User
                      </Button>
                    </Space>
                  )}
                </Space>
              )}

              {selectedReturn.returnStatus === 'submitted_to_support' && (isSupportUser || isSupport) && (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => {
                      setAssignVerificationModalVisible(true);
                    }}
                    block
                  >
                    Assign Verification Team
                  </Button>
                  {selectedReturn.assignedVerificationTeam && (
                    <Button
                      icon={<SwapOutlined />}
                      onClick={() => handleReassign(selectedReturn, 'verification')}
                      block
                    >
                      Reassign Verification Team
                    </Button>
                  )}
                </Space>
              )}

              {selectedReturn.returnStatus === 'inspection_accepted' && (isSupportUser || isSupport) && (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => {
                      setAssignFinanceModalVisible(true);
                    }}
                    block
                  >
                    Assign Finance Team (Process Refund)
                  </Button>
                  {selectedReturn.assignedFinance && (
                    <Button
                      icon={<SwapOutlined />}
                      onClick={() => handleReassign(selectedReturn, 'finance')}
                      block
                    >
                      Reassign Finance Team
                    </Button>
                  )}
                </Space>
              )}

              {selectedReturn.returnStatus === 'inspection_rejected' && isSupportUser && (
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={() => {
                    setAssignRedeliveryModalVisible(true);
                  }}
                  block
                >
                  Assign Delivery Agency (Re-delivery)
                </Button>
              )}

              {/* Show reassigned assignment info */}
              {selectedReturn.assignedSupportUser && (
                <div>
                  <Text strong>Assigned Support User: </Text>
                  <Text>{selectedReturn.assignedSupportUser.fullName || selectedReturn.assignedSupportUser.email}</Text>
                  {selectedReturn.assignedSupportUser && (isSupport || isSupportUser) && (
                    <Space style={{ marginLeft: 8 }}>
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => handleReassign(selectedReturn, 'support')}
                      >
                        Reassign
                      </Button>
                    </Space>
                  )}
                </div>
              )}
              {selectedReturn.assignedDeliveryAgency && (
                <div>
                  <Text strong>Assigned Delivery Agency: </Text>
                  <Text>{selectedReturn.assignedDeliveryAgency.fullName || selectedReturn.assignedDeliveryAgency.email}</Text>
                  {isSupportUser && (
                    <Space style={{ marginLeft: 8 }}>
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => handleReassign(selectedReturn, 'agency')}
                      >
                        Reassign
                      </Button>
                    </Space>
                  )}
                </div>
              )}
              {selectedReturn.assignedVerificationTeam && (
                <div>
                  <Text strong>Assigned Verification Team: </Text>
                  <Text>{selectedReturn.assignedVerificationTeam.fullName || selectedReturn.assignedVerificationTeam.email}</Text>
                  {(isSupport || isSupportUser) && (
                    <Space style={{ marginLeft: 8 }}>
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => handleReassign(selectedReturn, 'verification')}
                      >
                        Reassign
                      </Button>
                    </Space>
                  )}
                </div>
              )}
              {selectedReturn.assignedFinance && (
                <div>
                  <Text strong>Assigned Finance: </Text>
                  <Text>{selectedReturn.assignedFinance.fullName || selectedReturn.assignedFinance.email}</Text>
                  {(isSupport || isSupportUser) && (
                    <Space style={{ marginLeft: 8 }}>
                      <Button
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => handleReassign(selectedReturn, 'finance')}
                      >
                        Reassign
                      </Button>
                    </Space>
                  )}
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>

      {/* Assign Support User Modal */}
      <Modal
        title="Assign Support User"
        open={assignSupportModalVisible}
        onOk={handleAssignSupport}
        onCancel={() => {
          setAssignSupportModalVisible(false);
          setSelectedSupportUserId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a support user"
          value={selectedSupportUserId}
          onChange={setSelectedSupportUserId}
          options={supportUsers.map(user => ({
            value: user._id,
            label: `${user.fullName || user.email} (${user.role})`,
          }))}
        />
      </Modal>

      {/* Assign Agency Modal */}
      <Modal
        title="Assign Delivery Agency"
        open={assignAgencyModalVisible}
        onOk={handleAssignAgency}
        onCancel={() => {
          setAssignAgencyModalVisible(false);
          setSelectedAgencyId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a delivery agency"
          value={selectedAgencyId}
          onChange={setSelectedAgencyId}
          options={deliveryAgencies.map(agency => ({
            value: agency._id,
            label: `${agency.fullName || agency.email}`,
          }))}
        />
      </Modal>

      {/* Assign Verification Team Modal */}
      <Modal
        title="Assign Verification Team"
        open={assignVerificationModalVisible}
        onOk={handleAssignVerification}
        onCancel={() => {
          setAssignVerificationModalVisible(false);
          setSelectedVerificationTeamId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a verification team"
          value={selectedVerificationTeamId}
          onChange={setSelectedVerificationTeamId}
          options={verificationTeams.map(team => ({
            value: team._id,
            label: `${team.fullName || team.email}`,
          }))}
        />
      </Modal>

      {/* Assign Finance Modal */}
      <Modal
        title="Assign Finance Team"
        open={assignFinanceModalVisible}
        onOk={handleAssignFinance}
        onCancel={() => {
          setAssignFinanceModalVisible(false);
          setSelectedFinanceId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a finance user"
          value={selectedFinanceId}
          onChange={setSelectedFinanceId}
          options={financeUsers.map(user => ({
            value: user._id,
            label: `${user.fullName || user.email}`,
          }))}
        />
      </Modal>

      {/* Assign Re-delivery Modal */}
      <Modal
        title="Assign Re-delivery Agency"
        open={assignRedeliveryModalVisible}
        onOk={handleAssignRedelivery}
        onCancel={() => {
          setAssignRedeliveryModalVisible(false);
          setSelectedAgencyId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a delivery agency for re-delivery"
          value={selectedAgencyId}
          onChange={setSelectedAgencyId}
          options={deliveryAgencies.map(agency => ({
            value: agency._id,
            label: `${agency.fullName || agency.email}`,
          }))}
        />
      </Modal>

      {/* Create User Modal (for Support Admin only) */}
      {isSupport && (
        <Modal
          title="Create User"
          open={createUserModalVisible}
          onOk={() => createUserForm.submit()}
          onCancel={() => {
            setCreateUserModalVisible(false);
            createUserForm.resetFields();
          }}
          okText="Create User"
          okButtonProps={{ loading: creatingUser }}
          width={600}
        >
          <Form
            form={createUserForm}
            layout="vertical"
            onFinish={handleCreateUser}
          >
            <Form.Item
              name="role"
              label="User Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select role">
                <Select.Option value="support_user">Support User</Select.Option>
                <Select.Option value="verification_team">Verification Team</Select.Option>
              </Select>
            </Form.Item>

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
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' },
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
      )}

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

      {/* Reassign Modal */}
      <Modal
        title={`Reassign ${reassignType === 'support' ? 'Support User' : reassignType === 'agency' ? 'Delivery Agency' : reassignType === 'verification' ? 'Verification Team' : 'Finance User'}`}
        open={reassignModalVisible}
        onOk={handleConfirmReassign}
        onCancel={() => {
          setReassignModalVisible(false);
          setSelectedReassignId('');
          setReassignReason('');
          setSelectedReturn(null);
        }}
        okText="Reassign"
        okButtonProps={{ loading: reassigning }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select New {reassignType === 'support' ? 'Support User' : reassignType === 'agency' ? 'Delivery Agency' : reassignType === 'verification' ? 'Verification Team' : 'Finance User'}:</Text>
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder={`Select a ${reassignType === 'support' ? 'support user' : reassignType === 'agency' ? 'delivery agency' : reassignType === 'verification' ? 'verification team' : 'finance user'}`}
            value={selectedReassignId}
            onChange={setSelectedReassignId}
            options={
              reassignType === 'support' ? supportUsers.map(user => ({
                value: user._id,
                label: `${user.fullName || user.email}`,
              })) :
              reassignType === 'agency' ? deliveryAgencies.map(agency => ({
                value: agency._id,
                label: `${agency.fullName || agency.email}`,
              })) :
              reassignType === 'verification' ? verificationTeams.map(team => ({
                value: team._id,
                label: `${team.fullName || team.email}`,
              })) :
              financeUsers.map(user => ({
                value: user._id,
                label: `${user.fullName || user.email}`,
              }))
            }
          />
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
          setSelectedReturn(null);
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

export default SupportDashboard;
