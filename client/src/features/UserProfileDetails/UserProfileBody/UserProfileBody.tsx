import { Form } from 'antd';
import { ProfileBody } from 'components';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { updateUserProfileThunk } from 'redux/action/auth/authAction';
import { useEffect } from 'react';

export const UserProfileBody = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const {
    status: { loading },
    result,
  } = useAppSelector(authSelector);

  useEffect(() => {
    if (result) {
      const parts = result.fullName?.split(' ') || [];
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      form.setFieldsValue({
        email: result.email || '',
        firstName,
        lastName,
      });
    }
  }, [result, form]);

  const onFormSubmit = (values: any) => {
    if (!result?._id) return;
    dispatch(updateUserProfileThunk({ id: result._id, data: values }));
  };

  return (
    <ProfileBody
      form={form}
      onFormSubmit={onFormSubmit}
      loadingSubmit={loading}
    />
  );
};
