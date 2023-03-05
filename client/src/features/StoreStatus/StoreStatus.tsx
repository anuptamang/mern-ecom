import { Card, Statistic } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';

export const StoreStatus = () => {
  return (
    <Card className="w-full" title="Your Store">
      <ContentSkeleton loading={false} />
      <Statistic title="Your Products" value={16} />
      <Statistic title="Your Sales" value={`$9999`} />
      <Statistic title="Product Reviews" value={4} />
      <div className="text-center">
        <Link className="underline" to={`/${pageRoutes.userProducts}`}>
          Manage Store
        </Link>
      </div>
    </Card>
  );
};
