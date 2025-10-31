import { Button, Card, List, Image } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from 'assets/styles/Common.module.scss';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { fetchProducts } from 'redux/action/products';
import { Link } from 'react-router-dom';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import './ProductsHome.scss';

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
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
      dataSource={productList?.data || []}
      renderItem={(item: any) => (
        <List.Item>
          <Card
            className="product-card"
            cover={
              item.thumbnail ? (
                <div className="product-image-wrapper">
                  <Image
                    alt={item.title}
                    src={item.thumbnail}
                    preview={false}
                    className="product-image"
                  />
                </div>
              ) : (
                <div className="product-image-wrapper">
                  <ProductImagePlaceholder title={item.title || 'Product'} />
                </div>
              )
            }
            actions={[
              <Link key="view" to={`/products/${item._id}`}>
                <Button type="link">View Details</Button>
              </Link>,
            ]}
            hoverable
          >
            <Card.Meta
              title={<Link to={`/products/${item._id}`}>{item.title}</Link>}
              description={
                <div className="product-meta">
                  {item.body?.summary || item.description || 'No description available.'}
                  {item.price && (
                    <div className="product-price">${item.price.toFixed(2)}</div>
                  )}
                </div>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );
};
