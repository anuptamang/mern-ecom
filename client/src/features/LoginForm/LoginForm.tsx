import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import { pageRoutes } from 'data/static/pageRoutes';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type TProps = {};

const LoginForm = (props: TProps) => {
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
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Link to={`/${pageRoutes.forgotPassword}`}>Forgot Password!</Link>
        </Form.Item>

        <Form.Item>
          <Button
            style={{ marginRight: '10px', display: 'inline-block' }}
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Login
          </Button>
          Or <Link to={`/${pageRoutes.register}`}>Register Now!</Link>
        </Form.Item>
      </Form>
    </>
  );
};

export { LoginForm };
