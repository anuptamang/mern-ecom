import { UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';

type TProps = {};

const ForgotForm = (props: TProps) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Received values of form: ', values);
  };

  return (
    <>
      <Form initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your Email!' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Forgot Password
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export { ForgotForm };
