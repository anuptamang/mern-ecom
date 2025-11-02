import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal, Select, Form, Input } from 'antd';
import { 
  LockOutlined, 
  SwapOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  UserAddOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { useAuth } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import {
  getReturnRequestApi,
} from 'services/endPoints/return';
import {
  getVerificationTeamReturnsApi,
  assignReturnInspectorApi,
  reassignInspectorApi,
  rejectReturnAssignmentApi,
} from 'services/endPoints/return/returnWorkflowEndpoints';
import { getUsersApi, createUserApi, resetPasswordAdminApi } from 'services/endPoints/user/userListEndpoints';
import { WorkloadDashboard } from 'components';
import './VerificationTeamDashboard.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IReturn {
  _id: string;
  orderId: { _id: string; items: any[] };
  userId: { fullName: string; email: string };
  items: any[];
  returnAmount: number;
  reason: string;
  returnStatus: string;
  assignedVerificationTeam?: any;
  assignedInspector?: any;
}

const VerificationTeamDashboard = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<IReturn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignInspectorModalVisible, setAssignInspectorModalVisible] = useState(false);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  // Create user modal
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [createUserForm] = Form.useForm();
  const [creatingUser, setCreatingUser] = useState(false);
  // User management
  const [childUsers, setChildUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Password reset modal
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  // Reassign/reject modals
  const [reassignInspectorModalVisible, setReassignInspectorModalVisible] = useState(false);
  const [selectedReassignInspectorId, setSelectedReassignInspectorId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [reassigning, setReassigning] = useState(false);
  const [rejectAssignmentModalVisible, setRejectAssignmentModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadReturns();
    loadInspectors();
    loadChildUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL params for notification navigation
  useEffect(() => {
    const returnId = searchParams.get('returnId');
    if (returnId) {
      loadReturnById(returnId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const { data } = await getVerificationTeamReturnsApi();
      setReturns(data.returns || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

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

  const loadInspectors = async () => {
    try {
      const { data } = await getUsersApi({ role: 'return_inspector' });
      setInspectors(data.users || []);
    } catch (error) {
      console.error('Failed to load inspectors:', error);
    }
  };

  const loadChildUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await getUsersApi({ role: 'return_inspector' });
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
      loadInspectors(); // Also reload inspectors for assignment dropdown
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleViewDetails = async (returnRequest: IReturn) => {
    try {
      setSelectedReturn(returnRequest);
      setDetailModalVisible(true);
      const { data } = await getReturnRequestApi(returnRequest._id);
      if (data.returnRequest) {
        setSelectedReturn(data.returnRequest);
      }
    } catch (error: any) {
      message.error('Failed to load return details');
    }
  };

  const handleAssignInspector = async () => {
    if (!selectedReturn || !selectedInspectorId) {
      message.warning('Please select an inspector');
      return;
    }

    try {
      setAssigning(true);
      await assignReturnInspectorApi(selectedReturn._id, selectedInspectorId);
      message.success('Inspector assigned successfully');
      setAssignInspectorModalVisible(false);
      setSelectedInspectorId('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to assign inspector');
    } finally {
      setAssigning(false);
    }
  };

  // Reassign handler
  const handleReassignInspector = (returnRequest: IReturn) => {
    setSelectedReturn(returnRequest);
    setReassignInspectorModalVisible(true);
    setSelectedReassignInspectorId('');
    setReassignReason('');
    loadInspectors();
  };

  const handleConfirmReassignInspector = async () => {
    if (!selectedReturn || !selectedReassignInspectorId) {
      message.error('Please select an inspector');
      return;
    }

    try {
      setReassigning(true);
      await reassignInspectorApi(selectedReturn._id, selectedReassignInspectorId, reassignReason);
      message.success('Inspector reassigned successfully');
      setReassignInspectorModalVisible(false);
      setSelectedReassignInspectorId('');
      setReassignReason('');
      setSelectedReturn(null);
      await loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reassign inspector');
    } finally {
      setReassigning(false);
    }
  };

  // Reject handler
  const handleRejectAssignment = (returnRequest: IReturn) => {
    setSelectedReturn(returnRequest);
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
      await rejectReturnAssignmentApi(selectedReturn._id, rejectReason, 'verification');
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

  const handleCreateUser = async (values: any) => {
    try {
      setCreatingUser(true);
      await createUserApi({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        role: 'return_inspector',
      });
      message.success('Inspector created successfully');
      setCreateUserModalVisible(false);
      createUserForm.resetFields();
      loadInspectors();
      loadChildUsers(); // Reload child users list
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create inspector');
    } finally {
      setCreatingUser(false);
    }
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      in_inspection: { color: 'blue', icon: <ClockCircleOutlined /> },
      inspector_assigned: { color: 'cyan', icon: <UserAddOutlined /> },
    };
    const c = config[status] || { color: 'default', icon: null };
    return (
      <Tag color={c.color} icon={c.icon}>
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
    <div className="verification-team-dashboard">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Verification Team Dashboard</Title>
            <Text type="secondary">
              Manage return package inspections. Assign inspectors to verify package conditions.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setCreateUserModalVisible(true)}
          >
            Create Inspector
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Returns in Inspection ({returns.length})</Title>
        {returns.length === 0 ? (
          <Empty description="No returns in inspection" />
        ) : (
          <List
            dataSource={returns}
            renderItem={(returnRequest) => (
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
                  returnRequest.returnStatus === 'in_inspection' && !returnRequest.assignedInspector && (
                    <Button
                      type="default"
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setAssignInspectorModalVisible(true);
                      }}
                    >
                      Assign Inspector
                    </Button>
                  ),
                  returnRequest.assignedInspector && (
                    <>
                      <Button
                        icon={<SwapOutlined />}
                        onClick={() => handleReassignInspector(returnRequest)}
                      >
                        Reassign Inspector
                      </Button>
                    </>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Return #{returnRequest._id.slice(-8)}</Text>
                      {getStatusTag(returnRequest.returnStatus)}
                    </Space>
                  }
                  description={
                    <div>
                      <div>Order: #{returnRequest.orderId._id.toString().slice(-8)}</div>
                      <div>Customer: {returnRequest.userId.fullName || returnRequest.userId.email}</div>
                      <div>Amount: ${(returnRequest.returnAmount / 100).toFixed(2)}</div>
                      {returnRequest.assignedInspector && (
                        <div>
                          Inspector: {returnRequest.assignedInspector.fullName || returnRequest.assignedInspector.email}
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

      {/* Workload Dashboard */}
      <Card style={{ marginTop: 16 }}>
        <WorkloadDashboard />
      </Card>

      {/* User Management Section */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Inspectors ({childUsers.length})</Title>
        {childUsers.length === 0 ? (
          <Empty description="No inspectors found" />
        ) : (
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
                  <Tag color="purple">Inspector</Tag>
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
          />
        )}
      </Card>

      <Modal
        title="Return Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedReturn(null);
        }}
        footer={null}
        width={800}
      >
        {selectedReturn && (
          <div>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div><Text strong>Return ID: </Text>{selectedReturn._id}</div>
                <div><Text strong>Order ID: </Text>{selectedReturn.orderId._id}</div>
                <div><Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}</div>
                <div><Text strong>Status: </Text>{getStatusTag(selectedReturn.returnStatus)}</div>
                <div><Text strong>Amount: </Text>${(selectedReturn.returnAmount / 100).toFixed(2)}</div>
                <div><Text strong>Reason: </Text>{selectedReturn.reason}</div>
                <div>
                  <Text strong>Items: </Text>
                  <List
                    size="small"
                    dataSource={selectedReturn.items}
                    renderItem={(item: any) => (
                      <List.Item>{item.title} × {item.quantity}</List.Item>
                    )}
                  />
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="Assign Inspector"
        open={assignInspectorModalVisible}
        onOk={handleAssignInspector}
        onCancel={() => {
          setAssignInspectorModalVisible(false);
          setSelectedInspectorId('');
        }}
        okButtonProps={{ loading: assigning }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select an inspector"
          value={selectedInspectorId}
          onChange={setSelectedInspectorId}
          options={inspectors.map(inspector => ({
            value: inspector._id,
            label: `${inspector.fullName || inspector.email}`,
          }))}
        />
      </Modal>

      {/* Create Inspector Modal */}
      <Modal
        title="Create Inspector"
        open={createUserModalVisible}
        onOk={() => createUserForm.submit()}
        onCancel={() => {
          setCreateUserModalVisible(false);
          createUserForm.resetFields();
        }}
        okText="Create Inspector"
        okButtonProps={{ loading: creatingUser }}
        width={600}
      >
        <Form
          form={createUserForm}
          layout="vertical"
          onFinish={handleCreateUser}
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

      {/* Reassign Inspector Modal */}
      <Modal
        title="Reassign Inspector"
        open={reassignInspectorModalVisible}
        onOk={handleConfirmReassignInspector}
        onCancel={() => {
          setReassignInspectorModalVisible(false);
          setSelectedReassignInspectorId('');
          setReassignReason('');
          setSelectedReturn(null);
        }}
        okText="Reassign"
        okButtonProps={{ loading: reassigning }}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Select New Inspector:</Text>
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder="Select an inspector"
            value={selectedReassignInspectorId}
            onChange={setSelectedReassignInspectorId}
            options={inspectors.map(inspector => ({
              value: inspector._id,
              label: `${inspector.fullName || inspector.email}`,
            }))}
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

export default VerificationTeamDashboard;
