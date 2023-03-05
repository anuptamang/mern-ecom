import { Card, Statistic } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';

export const CartsStatus = () => {
  return (
    <>
      <Card className="w-full" title="Your Shopping">
        <ContentSkeleton loading={false} />
        <Statistic title="Your Orders" value={6} />
        <Statistic title="Your Purchase" value={`$5656`} />
        <Statistic title="Reviews" value={4} />
        <div className="text-center">
          <Link className="underline" to={`/${pageRoutes.userCarts}`}>
            Manage Carts
          </Link>
        </div>
      </Card>
    </>
  );
};
