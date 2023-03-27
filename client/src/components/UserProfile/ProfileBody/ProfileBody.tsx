import { Button, Form, FormInstance, Input, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const { Option } = Select;

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
  loadingSubmit: boolean;
};

export const ProfileBody = ({
  form,
  onFormSubmit,
  loadingSubmit = false,
}: TProfileBody) => {
  const formRef = useRef<FormInstance>(null);
  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const { hash } = useLocation();

  const action = hash?.slice(1);

  useEffect(() => {
    if (action === 'update') {
      setComponentDisabled(false);
    } else {
      setComponentDisabled(true);
    }

    if (action === 'view') {
      formRef.current?.resetFields();
    }
  }, [action]);

  return (
    <div className="pt-10">
      <Form
        ref={formRef}
        {...formItemLayout}
        form={form}
        disabled={componentDisabled}
        initialValues={{
          email: 'anup@gmail.com',
          firstName: 'Anup',
          lastName: 'Tamang',
        }}
      >
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
        >
          <Input />
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
        {action === 'update' && (
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" loading={loadingSubmit}>
              Submit
            </Button>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};
