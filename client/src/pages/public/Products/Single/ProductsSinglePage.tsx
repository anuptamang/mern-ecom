'use client';

import { Button, Card, Spin, message, Rate, Divider, Tag, Avatar } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { Container } from '@/components/UI';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import styles from '@/assets/styles/Common.module.scss';
import { useRouter, usePathname } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { addToCart, fetchMyCart } from '@/redux/slice/carts/cartsSlice';
import { authSelector } from '@/redux/slice';
import {
  fetchProductByIdApi,
  fetchRelatedProductsApi,
} from '@/services/endPoints/products/productsEndpoints';
import {
  ProductImageGallery,
  ProductRatings,
  ProductComments,
  RelatedProducts,
  WishlistButton,
  ChatBox,
  AuthModal,
} from '@/components';
import { EyeOutlined, LikeOutlined, ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
import './ProductsSinglePage.scss';

type Props = {
  productId?: string;
};

const ProductsSinglePage = (props: Props) => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <ProductDetails productId={props.productId} />
      </Container>
    </>
  );
};

export { ProductsSinglePage };

const ProductDetails = ({ productId }: { productId?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  // Extract ID from URL path if not provided as prop
  const id = productId || pathname.split('/').pop() || '';
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingProductTitle, setPendingProductTitle] = useState<string>('');
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const isBuyer = result?.role === 'user';

  // Handle scroll to hash when product is loaded and hash is present
  useEffect(() => {
    if (!product || loading) return;

    const scrollToHash = () => {
      // Check window.location.hash (browser)
      const hashFromWindow = window.location.hash.replace('#', '');
      const hash = hashFromWindow;

      if (!hash) return;

      console.log('Attempting to scroll to hash:', hash); // Debug log

      // Try multiple times with increasing delays to ensure element is rendered
      const tryScroll = (attempt = 0) => {
        const element = document.getElementById(hash);
        if (element) {
          console.log('Element found, scrolling:', hash); // Debug log
          // Scroll to element with smooth behavior
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add offset after scroll animation starts
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo({
              top: scrollTop + rect.top - 80,
              behavior: 'smooth',
            });
          }, 50);
        } else if (attempt < 15) {
          // Try again after a delay if element not found (max 15 attempts)
          console.log(`Attempt ${attempt + 1}: Element not found, retrying...`); // Debug log
          setTimeout(() => tryScroll(attempt + 1), 150 * (attempt + 1));
        } else {
          console.warn('Element not found after all attempts:', hash); // Debug log
        }
      };

      tryScroll();
    };

    // Small delay to ensure DOM is ready
    setTimeout(scrollToHash, 100);
  }, [product, loading]);

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await fetchProductByIdApi(id);
        setProduct(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load product');
        message.error(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product?._id) return;

      try {
        setLoadingRelated(true);
        const { data } = await fetchRelatedProductsApi(product._id);
        setRelatedProducts(data.products || []);
      } catch (err: any) {
        console.error('Failed to load related products:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    loadRelatedProducts();
  }, [product?._id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;

    if (!result) {
      setPendingProductId(product._id);
      setPendingProductTitle(product.title);
      setAuthModalVisible(true);
      return;
    }

    if (product.stock <= 0) {
      message.warning('Product is out of stock');
      return;
    }

    try {
      const quantity = 1;
      await dispatch(
        addToCart({
          productId: product._id,
          quantity,
        })
      ).unwrap();
      dispatch(fetchMyCart());
      message.success('Product added to cart');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const handleChatClick = () => {
    if (!result) {
      setPendingProductId(product?._id || null);
      setPendingProductTitle(product?.title || '');
      setAuthModalVisible(true);
      return;
    }
    setShowChat(!showChat);
  };

  const handleAuthSuccess = () => {
    setAuthModalVisible(false);
    if (pendingProductId) {
      // After successful auth, add to cart or open chat
      if (showChat) {
        setShowChat(true);
      } else {
        handleAddToCart({} as React.MouseEvent);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>{error || 'Product not found'}</p>
        <Button onClick={() => router.push(`/${pageRoutes.products}`)}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <Button onClick={() => router.push(`/${pageRoutes.products}`)}>
          ← Back to Products
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Product Image Gallery */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <ProductImageGallery images={product.images || []} />
        </div>

        {/* Product Details */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <Card>
            <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>{product.title}</h1>
            
            <div style={{ marginBottom: '16px' }}>
              <ProductRatings productId={product._id} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#0071e3' }}>
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span
                  style={{
                    marginLeft: '12px',
                    fontSize: '18px',
                    textDecoration: 'line-through',
                    color: '#999',
                  }}
                >
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Tag color={product.stock > 0 ? 'green' : 'red'}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </Tag>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{product.description}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </Button>
              <WishlistButton productId={product._id} />
              {isBuyer && !isSeller && (
                <Button
                  icon={<MessageOutlined />}
                  onClick={handleChatClick}
                >
                  Chat with Seller
                </Button>
              )}
            </div>

            <Divider />

            <div>
              <h3>Product Information</h3>
              <ul>
                <li>Category: {product.category}</li>
                <li>Brand: {product.brand || 'N/A'}</li>
                <li>SKU: {product.sku || 'N/A'}</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Product Comments Section */}
      <div style={{ marginTop: '48px' }} id="comments">
        <ProductComments productId={product._id} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <RelatedProducts products={relatedProducts} loading={loadingRelated} />
        </div>
      )}

      {/* Chat Box */}
      {showChat && product && (
        <ChatBox
          productId={product._id}
          sellerId={product.seller?._id}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingProductId(null);
          setPendingProductTitle('');
        }}
        onSuccess={handleAuthSuccess}
        productId={pendingProductId}
        productTitle={pendingProductTitle}
      />
    </>
  );
};
