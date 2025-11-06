'use client';

import { Button, Form, FormInstance, Input, Space, Divider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AddressForm } from '@/components/AddressForm/AddressForm';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

type TProfileBody = {
  form: FormInstance<any> | undefined;
  onFormSubmit?: (values: any) => void;
  onCancel?: () => void;
  loadingSubmit: boolean;
  userRole?: string; // Pass user role to determine if seller
};

export const ProfileBody = ({
  form,
  onFormSubmit,
  onCancel,
  loadingSubmit = false,
  userRole,
}: TProfileBody) => {
  const formRef = useRef<FormInstance>(null);
  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const pathname = usePathname();
  const [isEditing, setIsEditing] = useState(false);

  // Extract hash from URL (e.g., /profile#update)
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const action = hash?.slice(1);

  useEffect(() => {
    if (action === 'update') {
      setComponentDisabled(false);
      setIsEditing(true);
    }
  }, [action]);

  const handleEdit = () => {
    setComponentDisabled(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setComponentDisabled(true);
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = (values: any) => {
    if (onFormSubmit) {
      onFormSubmit(values);
      setComponentDisabled(true);
      setIsEditing(false);
    }
  };

  return (
    <Form
      {...formItemLayout}
      form={form || formRef.current}
      onFinish={handleSubmit}
      disabled={componentDisabled}
      scrollToFirstError
    >
      <Form.Item
        name="firstName"
        label="First Name"
        rules={[{ required: true, message: 'Please input your first name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="lastName"
        label="Last Name"
        rules={[{ required: true, message: 'Please input your last name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          { type: 'email', message: 'The input is not valid E-mail!' },
          { required: true, message: 'Please input your E-mail!' },
        ]}
      >
        <Input disabled />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[
          { required: true, message: 'Please input your phone number!' },
        ]}
      >
        <Input />
      </Form.Item>

      <Divider>Address Information</Divider>

      <AddressForm form={form || formRef.current} disabled={componentDisabled} />

      {userRole === 'seller' && (
        <>
          <Divider>Seller Information</Divider>
          <Form.Item
            name="bankAccount"
            label="Bank Account"
            rules={[
              { required: true, message: 'Please input your bank account!' },
            ]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      <Form.Item {...tailFormItemLayout}>
        <Space>
          {isEditing ? (
            <>
              <Button type="primary" htmlType="submit" loading={loadingSubmit}>
                Save Changes
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button type="primary" onClick={handleEdit}>
              Edit Profile
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};
