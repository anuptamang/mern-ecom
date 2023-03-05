import { Card } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';

export const SettingsStatus = () => {
  return (
    <>
      <Card className="w-full" title="Your Settings">
        <ContentSkeleton loading={false} />
        <div className="mb-4">
          <strong className="">User Type: </strong>
          <strong className="text-purple">Buyer</strong>
        </div>
        <div className="mb-4">
          <strong className="">Store Theme: </strong>
          <strong className="text-purple">Dark</strong>
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
