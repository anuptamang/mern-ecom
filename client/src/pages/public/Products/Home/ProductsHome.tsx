import { Button, Card, List } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from 'assets/styles/Common.module.scss';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { fetchProducts } from 'redux/action/products';
import { Link } from 'react-router-dom';

type TProps = {};

const ProductsHome = (props: TProps) => {
  const title = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <h1>All Products</h1>
        <ProductsList />
      </Container>
    </>
  );
};

export { ProductsHome };

const ProductsList = () => {
  const dispatch = useAppDispatch();
  const { productList } = useAppSelector((s) => s.products);
  useEffect(() => {
    dispatch(fetchProducts({} as any));
  }, [dispatch]);

  return (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={productList?.data || []}
      renderItem={(item: any) => (
        <List.Item>
          <Card
            cover={item.thumbnail ? <img alt={item.title} src={item.thumbnail} /> : null}
            actions={[<Link key="view" to={`/products/${item._id}`}>View</Link>]}
          >
            <Card.Meta title={item.title} description={item.body?.summary || ''} />
          </Card>
        </List.Item>
      )}
    />
  );
};
