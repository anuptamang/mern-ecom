import { Card, Statistic } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { getMyWishlistApi } from 'services/endPoints/wishlist';

export const WishlistStatus = () => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { result } = useAppSelector(authSelector);

  useEffect(() => {
    const load = async () => {
      if (!result?._id || result?.role === 'seller') {
        setLoading(false);
        return;
      }
      try {
        const { data } = await getMyWishlistApi();
        setCount(data.count || 0);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [result?._id, result?.role]);

  if (result?.role === 'seller') {
    return null; // Don't show for sellers
  }

  return (
    <Card className="w-full" title="My Wishlist">
      <ContentSkeleton loading={loading} />
      <Statistic title="Items in Wishlist" value={count} />
      <div className="text-center">
        <Link className="underline" to={`/${pageRoutes.user}/wishlist`}>
          View Wishlist
        </Link>
      </div>
    </Card>
  );
};

