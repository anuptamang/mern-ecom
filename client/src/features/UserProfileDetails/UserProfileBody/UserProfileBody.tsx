import { Form, message } from 'antd';
import { ProfileBody } from 'components';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { updateUserProfileThunk, fetchUserProfile } from 'redux/action/auth/authAction';
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

  const onFormSubmit = async (values: any) => {
    if (!result?._id) return;
    try {
      // Convert firstName and lastName to fullName
      const fullName = `${values.firstName} ${values.lastName}`.trim();
      const updateData = {
        email: values.email,
        fullName,
      };
      await dispatch(updateUserProfileThunk({ id: result._id, data: updateData })).unwrap();
      // Refresh user profile to show updated data
      dispatch(fetchUserProfile({ id: result._id }));
      message.success('Profile updated successfully');
    } catch (e: any) {
      message.error(e?.message || 'Failed to update profile');
    }
  };

  return (
    <ProfileBody
      form={form}
      onFormSubmit={onFormSubmit}
      loadingSubmit={loading}
    />
  );
};
