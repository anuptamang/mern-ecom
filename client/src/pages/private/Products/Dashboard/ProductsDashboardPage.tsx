import React, { useEffect, useState } from 'react';
import { Button, Card, List, message } from 'antd';
import { fetchMyProductsApi } from 'services/endPoints/products/productsEndpoints';
import { getToken } from 'utils/localStorage';
import { Link } from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import { Container } from 'components/UI';

type Props = {};

const ProductsDashboardPage = (props: Props) => {
  const title = usePageTitle();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const { data } = await fetchMyProductsApi();
        setProducts(data.data || []);
      } catch (e: any) {
        message.error(e?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {title}
      <Container className="py-6">
        <h2 className="mb-6">My Products</h2>
        <List
          grid={{ gutter: 16, column: 3 }}
          loading={loading}
          dataSource={products}
          renderItem={(item: any) => (
            <List.Item>
              <Card
                cover={item.thumbnail ? <img alt={item.title} src={item.thumbnail} /> : null}
                actions={[<Link key="view" to={`/products/${item._id}`}>View</Link>]}
              >
                <Card.Meta title={item.title} description={item.body?.summary || ''} />
                <div className="mt-2">Price: ${item.body?.price || 0}</div>
              </Card>
            </List.Item>
          )}
        />
        {products.length === 0 && !loading && <div>No products yet.</div>}
      </Container>
    </>
  );
};

export { ProductsDashboardPage };
