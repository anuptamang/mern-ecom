import { Helmet } from 'react-helmet-async';
import { Card } from 'antd';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';

export const UserSettingsPage = () => {
  const title = usePageTitle();
  const { result } = useAppSelector(authSelector);

  return (
    <>
      {title}
      <Helmet>
        <title>User Settings | My App</title>
      </Helmet>
      <Container className="py-6">
        <h2 className="mb-6">Settings</h2>
        <Card title="Account Information">
          <div className="mb-4">
            <strong>User Type: </strong>
            <span className="text-purple-600">{result?.role || 'user'}</span>
          </div>
          <div className="mb-4">
            <strong>Email: </strong>
            <span>{result?.email || 'N/A'}</span>
          </div>
          <div className="mb-4">
            <strong>Full Name: </strong>
            <span>{result?.fullName || 'N/A'}</span>
          </div>
        </Card>
      </Container>
    </>
  );
};
