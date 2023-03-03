import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { login } from 'redux/action/auth/authAction';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { ILogin } from 'types/store/auth/authSliceTypes';

/**
 * This is the login form, which takes email and password as an input and sends a logn request to the server.
 * @component feature
 * @param props none
 * @returns Login form component
 */

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(authSelector);

  const onFinish = (values: ILogin) => {
    dispatch(login({ email: values.email, password: values.password }));
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
            loading={status.loading}
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
