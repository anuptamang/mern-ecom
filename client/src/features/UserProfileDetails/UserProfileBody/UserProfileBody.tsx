import { Form } from 'antd';
import { ProfileBody } from 'components';
import { authSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';

export const UserProfileBody = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const {
    status: { loading },
  } = useAppSelector(authSelector);

  const onFormSubmit = (values: any) => {
    //
  };

  return (
    <ProfileBody
      form={form}
      onFormSubmit={onFormSubmit}
      loadingSubmit={loading}
    />
  );
};
