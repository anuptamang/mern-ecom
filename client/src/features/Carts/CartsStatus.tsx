import { Card, Statistic } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserStatsApi } from 'services/endPoints/user/userEndpoints';
import { getToken } from 'utils/localStorage';

export const CartsStatus = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const { data } = await getUserStatsApi(token);
        setStats(data);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Card className="w-full" title="Your Shopping">
        <ContentSkeleton loading={loading} />
        <Statistic title="Your Orders" value={stats.totalOrders} />
        <Statistic title="Your Purchase" value={`$${stats.totalSpent.toFixed(2)}`} />
        <div className="text-center">
          <Link className="underline" to={`/${pageRoutes.userCarts}`}>
            Manage Carts
          </Link>
        </div>
      </Card>
    </>
  );
};
