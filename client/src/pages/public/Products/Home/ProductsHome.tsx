import { Button, Card, List, Image, message } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from 'assets/styles/Common.module.scss';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { fetchProducts } from 'redux/action/products';
import { Link, useNavigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import { AuthModal } from 'components/AuthModal';
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
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

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

  const handleAddToCart = (productId: string, stock: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!result) {
      setPendingProductId(productId);
      setAuthModalVisible(true);
      return;
    }

    if (isSeller) {
      message.warning('Sellers cannot purchase products');
      return;
    }

    if (stock <= 0) {
      message.error('Product is out of stock');
      return;
    }

    dispatch(addToCart({ productId }))
      .unwrap()
      .then(() => {
        message.success('Product added to cart');
        // Refresh cart count after adding
        dispatch(fetchMyCart());
      })
      .catch((error: any) => {
        // If error is about needing to log in, open auth modal instead of showing error
        const errorMessage = error?.message || error?.payload || String(error);
        if (errorMessage.includes('log in') || errorMessage.includes('Please log in')) {
          setPendingProductId(productId);
          setAuthModalVisible(true);
        } else if (error?.response?.status !== 401) {
          message.error(errorMessage || 'Failed to add product to cart');
        }
      });
  };

  const handleAuthSuccess = async () => {
    if (pendingProductId) {
      try {
        await dispatch(addToCart({ productId: pendingProductId })).unwrap();
        message.success('Product added to cart');
        dispatch(fetchMyCart());
        setPendingProductId(null);
      } catch (error: any) {
        message.error(error?.message || 'Failed to add product to cart');
      }
    }
  };

  return (
    <>
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
                    disabled={(item.stock || 0) <= 0}
                    onClick={(e) => handleAddToCart(item._id, item.stock || 0, e)}
                  >
                    Add to Cart
                  </Button>
                ) : !result ? (
                  <Button
                    type="primary"
                    size="small"
                    disabled={(item.stock || 0) <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingProductId(item._id);
                      setAuthModalVisible(true);
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
                  <div className="product-stock">
                    {item.stock !== undefined ? (
                      <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                        {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                      </span>
                    ) : (
                      <span className="stock-unknown">Stock information unavailable</span>
                    )}
                  </div>
                </div>
              }
            />
          </Card>
        </List.Item>
      )}
    />
    <AuthModal
      open={authModalVisible}
      onClose={() => {
        setAuthModalVisible(false);
        setPendingProductId(null);
      }}
      onSuccess={handleAuthSuccess}
    />
  </>
  );
};
