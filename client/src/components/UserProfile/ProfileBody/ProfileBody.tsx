import { Button, Form, FormInstance, Input, Space, Divider } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AddressForm } from 'components/AddressForm/AddressForm';

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
};

export const ProfileBody = ({
  form,
  onFormSubmit,
  onCancel,
  loadingSubmit = false,
}: TProfileBody) => {
  const formRef = useRef<FormInstance>(null);
  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const { hash } = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const action = hash?.slice(1);

  useEffect(() => {
    // Support both hash-based navigation and button-based editing
    if (action === 'update') {
      setComponentDisabled(false);
      setIsEditing(true);
    } else if (action === 'view') {
      setComponentDisabled(true);
      setIsEditing(false);
      formRef.current?.resetFields();
    }
  }, [action]);

  const handleEdit = () => {
    setComponentDisabled(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setComponentDisabled(true);
    setIsEditing(false);
    // Reset form to original values
    formRef.current?.resetFields();
    // Call optional onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (values: any) => {
    if (onFormSubmit) {
      try {
        await onFormSubmit(values);
        // After successful submit, disable form to show saved state
        // User can click Edit again if they want to make more changes
        setIsEditing(false);
        setComponentDisabled(true);
      } catch (error) {
        // Error handling is done in the parent component
        // Keep form editable if there's an error so user can fix and retry
      }
    }
  };

  return (
    <div className="pt-10">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        {!isEditing ? (
          <Button type="primary" onClick={handleEdit}>
            Edit Profile
          </Button>
        ) : (
          <Space>
            <Button onClick={handleCancel} disabled={loadingSubmit}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => formRef.current?.submit()} loading={loadingSubmit}>
              Save Changes
            </Button>
          </Space>
        )}
      </div>
      <Form
        ref={formRef}
        {...formItemLayout}
        form={form}
        disabled={componentDisabled}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="email"
          label="E-mail"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            {
              required: true,
              message: 'Please input your first name!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            {
              required: true,
              message: 'Please input your last name!',
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Divider>Contact Information</Divider>
        <Form.Item
          name="phone"
          label="Phone"
        >
          <Input placeholder="+1 234 567 8900" />
        </Form.Item>
        <Form.Item
          name="secondaryPhone"
          label="Secondary Phone"
        >
          <Input placeholder="+1 234 567 8900" />
        </Form.Item>
        <Form.Item
          name="secondaryEmail"
          label="Secondary Email"
        >
          <Input type="email" placeholder="secondary@example.com" />
        </Form.Item>
        <Divider>Addresses</Divider>
        <AddressForm form={form} namePrefix="primaryAddress" label="Primary Address" />
        <AddressForm form={form} namePrefix="secondaryAddress" label="Secondary Address" />
      </Form>
    </div>
  );
};
