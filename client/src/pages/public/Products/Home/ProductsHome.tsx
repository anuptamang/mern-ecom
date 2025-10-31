import { Button, Card, List, Image, message } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from 'assets/styles/Common.module.scss';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { fetchProducts } from 'redux/action/products';
import { Link, useNavigate } from 'react-router-dom';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
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
  const navigate = useNavigate();
  const { productList } = useAppSelector((s) => s.products);
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  useEffect(() => {
    dispatch(fetchProducts({} as any));
  }, [dispatch]);

  const handleCardClick = (productId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement;
    if (
      target.closest('.ant-btn') ||
      target.closest('.product-card-actions') ||
      target.tagName === 'A'
    ) {
      return;
    }
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!result) {
      message.warning('Please log in to add items to cart');
      return;
    }

    if (isSeller) {
      message.warning('Sellers cannot purchase products');
      return;
    }

    dispatch(addToCart({ productId }));
    message.success('Product added to cart');
  };

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
      dataSource={productList?.data || []}
      renderItem={(item: any) => (
        <List.Item>
          <Card
            className="product-card"
            onClick={(e) => handleCardClick(item._id, e)}
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
              <div key="view" className="product-card-actions">
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${item._id}`);
                  }}
                >
                  View
                </Button>
              </div>,
              <div key="cart" className="product-card-actions">
                {!isSeller && result ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={(e) => handleAddToCart(item._id, e)}
                  >
                    Add to Cart
                  </Button>
                ) : !result ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      message.warning('Please log in to add items to cart');
                    }}
                  >
                    Add to Cart
                  </Button>
                ) : null}
              </div>,
            ]}
            hoverable
          >
            <Card.Meta
              title={item.title}
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
