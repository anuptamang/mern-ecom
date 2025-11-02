import React, { useEffect, useState } from 'react';
import { Card, List, Button, message, Empty, Spin, Typography, Space, Modal, Form, Input, Select, Tabs, Tag } from 'antd';
import { UserAddOutlined, TeamOutlined, EyeOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from 'hooks';
import { getUsersApi, createUserApi, resetPasswordAdminApi } from 'services/endPoints/user/userListEndpoints';
import { WorkloadDashboard, BannerManagement } from 'components';
import './AdminDashboard.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  delivererType?: string;
  deliveryAgencyId?: string;
}

const AdminDashboard = () => {
  const auth = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('delivery_agency');
  // Password reset modal
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Load users based on active tab
      let role = 'delivery_agency';
      if (activeTab === 'support') role = 'support';
      else if (activeTab === 'finance') role = 'finance';
      
      const { data } = await getUsersApi({ role });
      setUsers(data.users || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      setCreating(true);
      await createUserApi({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        role: values.role,
        delivererType: values.delivererType,
        deliveryAgencyId: values.deliveryAgencyId,
      });
      message.success('User created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = (user: IUser) => {
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
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      delivery_agency: 'Delivery Agency',
      support: 'Support Admin',
      finance: 'Finance',
    };
    return labels[role] || role;
  };

  const tabItems = [
    {
      key: 'banners',
      label: 'Banner Management',
      children: (
        <BannerManagement />
      ),
    },
    {
      key: 'workload',
      label: 'Workload Dashboard',
      children: (
        <WorkloadDashboard />
      ),
    },
    {
      key: 'delivery_agency',
      label: 'Delivery Agencies',
      children: (
        <List
          dataSource={users}
          loading={loading}
          renderItem={(user) => (
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
                <Tag color="blue">{getRoleLabel(user.role)}</Tag>
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
          locale={{ emptyText: <Empty description="No delivery agencies found" /> }}
        />
      ),
    },
    {
      key: 'support',
      label: 'Support Admins',
      children: (
        <List
          dataSource={users}
          loading={loading}
          renderItem={(user) => (
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
                <Tag color="green">{getRoleLabel(user.role)}</Tag>
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
          locale={{ emptyText: <Empty description="No support admins found" /> }}
        />
      ),
    },
    {
      key: 'finance',
      label: 'Finance Users',
      children: (
        <List
          dataSource={users}
          loading={loading}
          renderItem={(user) => (
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
                <Tag color="purple">{getRoleLabel(user.role)}</Tag>
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
          locale={{ emptyText: <Empty description="No finance users found" /> }}
        />
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Admin Dashboard</Title>
            <Text type="secondary">
              Manage users and system settings
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create User
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      </Card>

      <Modal
        title="Create New User"
        open={createModalVisible}
        onOk={() => createForm.submit()}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        okText="Create User"
        okButtonProps={{ loading: creating }}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Form.Item
            name="role"
            label="User Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="delivery_agency">Delivery Agency</Select.Option>
              <Select.Option value="support">Support Admin</Select.Option>
              <Select.Option value="finance">Finance</Select.Option>
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
    </div>
  );
};

export default AdminDashboard;
