'use client';

import { Helmet } from 'react-helmet-async';
import { Card, Form, Input, Button, message, Space } from 'antd';
import { useState } from 'react';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { Container } from '@/components/UI';
import { usePageTitle } from '@/hooks/usePageTitle';
import { changePasswordApi } from '@/services/endPoints/user/userListEndpoints';
import { LockOutlined } from '@ant-design/icons';

export const UserSettingsPage = () => {
  const title = usePageTitle();
  const { result } = useAppSelector(authSelector);
  const [passwordForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await changePasswordApi({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      {title}
      <Helmet>
        <title>User Settings | My App</title>
      </Helmet>
      <Container className="py-6">
        <h2 className="mb-6">Settings</h2>
        
        <Card title="Account Information" style={{ marginBottom: 16 }}>
          <div className="mb-4">
            <strong>User Type: </strong>
            <span className="text-purple-600">{result?.role || 'user'}</span>
          </div>
          <div className="mb-4">
            <strong>Email: </strong>
            <span>{result?.email || 'N/A'}</span>
          </div>
          <div className="mb-4">
            <strong>Full Name: </strong>
            <span>{result?.fullName || 'N/A'}</span>
          </div>
        </Card>

        <Card title={<span><LockOutlined /> Change Password</span>}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password placeholder="Enter current password" />
            </Form.Item>
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
                { required: true, message: 'Please confirm your new password' },
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
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={changingPassword}>
                  Change Password
                </Button>
                <Button onClick={() => passwordForm.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Container>
    </>
  );
};
