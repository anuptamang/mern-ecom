import { Form } from 'antd';
import { ProfileBody } from 'components';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { updateUserProfileThunk } from 'redux/action/auth/authAction';

export const UserProfileBody = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const {
    status: { loading },
  } = useAppSelector(authSelector);

  const { result } = useAppSelector(authSelector);

  const onFormSubmit = (values: any) => {
    if (!result?._id) return;
    dispatch(updateUserProfileThunk({ id: result._id, data: values }));
  };

  return (
    <ProfileBody
      form={form}
      onFormSubmit={onFormSubmit}
      loadingSubmit={loading}
      initialValues={{ fullName: result?.fullName, email: result?.email }}
    />
  );
};
