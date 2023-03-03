import { UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';

/**
 * This is the forgot password form, which takes email as an input and sends a submit request to the server.
 * @component feature
 * @param props none
 * @returns Forgot password form component
 */

const ForgotForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: string) => {
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
