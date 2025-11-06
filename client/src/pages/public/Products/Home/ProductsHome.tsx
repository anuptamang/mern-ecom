'use client';

import { Button, Card, List, Image, message } from 'antd';
import { Container } from '@/components/UI';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from '@/assets/styles/Common.module.scss';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { fetchProducts } from '@/redux/action/products';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pageRoutes } from '@/data/static/pageRoutes';
import { ProductImage } from '@/components/ProductImage';
import { addToCart, fetchMyCart } from '@/redux/slice/carts/cartsSlice';
import { authSelector } from '@/redux/slice';
import { AuthModal } from '@/components/AuthModal';
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
  const router = useRouter();
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
    router.push(`/products/${productId}`);
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
      // After successful auth, try to add to cart again
      const product = productList.find((p: any) => p._id === pendingProductId);
      if (product) {
        const mockEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent;
        await handleAddToCart(pendingProductId, product.stock, mockEvent);
      }
      setPendingProductId(null);
    }
    setAuthModalVisible(false);
  };

  return (
    <>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        dataSource={productList}
        renderItem={(product: any) => (
          <List.Item>
            <Card
              hoverable
              className="product-card"
              cover={
                <div
                  onClick={(e) => handleCardClick(product._id, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <ProductImage
                    src={product.images?.[0] || ''}
                    alt={product.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                </div>
              }
              actions={[
                <div key="actions" className="product-card-actions">
                  <Button
                    type="primary"
                    onClick={(e) => handleAddToCart(product._id, product.stock, e)}
                    disabled={product.stock <= 0 || isSeller}
                  >
                    Add to Cart
                  </Button>
                  <Link href={`/products/${product._id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>,
              ]}
            >
              <Card.Meta
                title={
                  <Link href={`/products/${product._id}`} style={{ color: 'inherit' }}>
                    {product.title}
                  </Link>
                }
                description={
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0071e3' }}>
                      ${product.price}
                    </div>
                    {product.stock <= 0 && (
                      <div style={{ color: 'red', marginTop: '8px' }}>Out of Stock</div>
                    )}
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <AuthModal
        visible={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingProductId(null);
        }}
        onSuccess={handleAuthSuccess}
        productId={pendingProductId}
      />
    </>
  );
};
