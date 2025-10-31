import { Card } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';

export const SettingsStatus = () => {
  const { result } = useAppSelector(authSelector);

  return (
    <>
      <Card className="w-full" title="Your Settings">
        <ContentSkeleton loading={false} />
        <div className="mb-4">
          <strong className="">User Type: </strong>
          <strong className="text-purple">{result?.role || 'user'}</strong>
        </div>
        <div className="mb-4">
          <strong className="">Email: </strong>
          <strong className="text-purple">{result?.email || 'N/A'}</strong>
        </div>
        <div className="text-center">
          <Link className="underline" to={`/${pageRoutes.userSettings}`}>
            Manage Settings
          </Link>
        </div>
      </Card>
    </>
  );
};
