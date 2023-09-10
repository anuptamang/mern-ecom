import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword, validateUser } from 'redux/action/auth';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { ILogin } from 'types';
import { notify } from 'utils';

/**
 * This is the forgot password form, which takes email as an input and sends a submit request to the server.
 * @component feature
 * @param props none
 * @returns Forgot password form component
 */

const ForgotForm = () => {
  // const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { result, status } = useAppSelector(authSelector);
  const navigate = useNavigate();

  const onFinish = async (values: ILogin) => {
    if (result?.email) {
      await dispatch(
        changePassword({ email: result?.email, password: values.password })
      );
      await console.log('password changed!');
      await navigate('/login');
    } else {
      dispatch(validateUser({ email: values.email }));
    }
  };

  useEffect(() => {
    if (status.error.message && !status.success) {
      notify(status.error.message, 'forgot-error', 'error');
    } else if (status.success) {
      console.log('show change password form!');
    }
  }, [status.error.message, status.success]);

  // useEffect(() => {
  //   if()
  // })

  return (
    <>
      <Form
        initialValues={{
          email: result?.email || '',
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your Email!' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        {result?.email && (
          <>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your new password!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="New Password"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please re-type your new password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match.')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Re-Type New Password"
              />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={status.loading}>
            Forgot Password
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export { ForgotForm };
