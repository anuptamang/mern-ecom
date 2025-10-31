import { Card, Statistic } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserStatsApi } from 'services/endPoints/user/userEndpoints';
import { getToken } from 'utils/localStorage';

export const StoreStatus = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0 });

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
    <Card className="w-full" title="Your Store">
      <ContentSkeleton loading={loading} />
      <Statistic title="Your Products" value={stats.totalProducts} />
      <Statistic title="Your Sales" value={stats.totalSales} />
      <div className="text-center">
        <Link className="underline" to={`/${pageRoutes.userProducts}`}>
          Manage Store
        </Link>
      </div>
    </Card>
  );
};
