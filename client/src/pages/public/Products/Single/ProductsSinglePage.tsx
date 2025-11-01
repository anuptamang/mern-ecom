import { Button, Card, Spin, message, Rate, Divider, Tag, Avatar } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'assets/styles/Common.module.scss';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import {
  fetchProductByIdApi,
  fetchRelatedProductsApi,
} from 'services/endPoints/products/productsEndpoints';
import {
  ProductImageGallery,
  ProductRatings,
  ProductComments,
  RelatedProducts,
  WishlistButton,
  ChatBox,
} from 'components';
import { EyeOutlined, LikeOutlined, ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
import './ProductsSinglePage.scss';

type Props = {};

const ProductsSinglePage = (props: Props) => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <ProductDetails />
      </Container>
    </>
  );
};

export { ProductsSinglePage };

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const isBuyer = result?.role === 'user';

  // Handle scroll to hash when product is loaded and hash is present
  useEffect(() => {
    if (!product || loading) return;

    const scrollToHash = () => {
      // Check both location.hash (React Router) and window.location.hash (browser)
      const hashFromLocation = location.hash.replace('#', '');
      const hashFromWindow = window.location.hash.replace('#', '');
      const hash = hashFromWindow || hashFromLocation;

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

      // Start trying after a short initial delay to ensure DOM is ready
      setTimeout(() => tryScroll(), 200);
    };

    scrollToHash();
  }, [product, loading, location.hash]);

  // Also listen for hash changes on window
  useEffect(() => {
    const handleHashChange = () => {
      if (!product || loading) return;
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              const rect = element.getBoundingClientRect();
              const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
              window.scrollTo({
                top: scrollTop + rect.top - 80,
                behavior: 'smooth',
              });
            }, 50);
          }
        }, 200);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [product, loading]);

  useEffect(() => {
    if (!id) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProductByIdApi(id)
      .then((res) => {
        if (isMounted) {
          setProduct(res.data);
          setLoading(false);

          // Fetch related products
          setLoadingRelated(true);
          fetchRelatedProductsApi(id, 4)
            .then((relatedRes) => {
              if (isMounted) {
                setRelatedProducts(relatedRes.data || []);
              }
            })
            .catch(() => {
              // Silently fail for related products
            })
            .finally(() => {
              if (isMounted) {
                setLoadingRelated(false);
              }
            });
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load product');
          setLoading(false);
          message.error('Failed to load product details');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Product not found'}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Top Section: Image Gallery (Left) and Product Info (Right) */}
      <div className="product-detail-top">
        <div className="product-image-section">
          <ProductImageGallery
            thumbnail={product.thumbnail}
            images={product.images || []}
            productTitle={product.title}
          />
        </div>

        <div className="product-info-section">
          <Card>
            <div className="product-header">
              <h1 className="product-title">{product.title}</h1>
              <div className="product-meta">
                {product.rating > 0 && (
                  <div className="product-rating">
                    <Rate disabled value={product.rating} allowHalf />
                    <span className="rating-value">
                      ({product.rating.toFixed(1)})
                    </span>
                  </div>
                )}
                <div className="product-stats">
                  {product.views > 0 && (
                    <span className="stat-item">
                      <EyeOutlined /> {product.views} views
                    </span>
                  )}
                  {product.likes > 0 && (
                    <span className="stat-item">
                      <LikeOutlined /> {product.likes} likes
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Divider />

            <div className="product-price-section">
              {product.price && (
                <div className="product-price">
                  <span className="currency">$</span>
                  <span className="amount">{product.price.toFixed(2)}</span>
                </div>
              )}
            </div>

            {product.estimatedDeliveryDays && (
              <div className="product-delivery-info" style={{ marginTop: 16 }}>
                <Tag color="blue">
                  Estimated Delivery: {product.estimatedDeliveryDays} {product.estimatedDeliveryDays === 1 ? 'day' : 'days'}
                </Tag>
              </div>
            )}

            <Divider />

            <div className="product-description">
              <h3>Description</h3>
              <p>
                {product.body?.summary ||
                  product.body?.full ||
                  product.description ||
                  'No description available.'}
              </p>
            </div>

            {product.categories && product.categories.length > 0 && (
              <div className="product-categories">
                <h3>Categories</h3>
                <div className="category-tags">
                  {product.categories.map((cat: string, index: number) => (
                    <Tag key={index} color="blue">
                      {cat}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {product.userID && (
              <>
                <Divider />
                <div className="product-seller-info">
                  <h3>Seller Information</h3>
                  <div className="seller-details">
                    <Avatar
                      src={(product.userID as any)?.profilePhoto}
                      icon={<UserOutlined />}
                      size={64}
                      className="seller-avatar"
                    />
                    <div className="seller-info">
                      <div className="seller-name">
                        {(product.userID as any)?.fullName || 'Unknown Seller'}
                      </div>
                      {(product.userID as any)?.email && (
                        <div className="seller-email">
                          <MailOutlined /> {(product.userID as any)?.email}
                        </div>
                      )}
                    </div>
                  </div>
                  {!isSeller && isBuyer && (
                    <div className="seller-chat-button" style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        icon={<MessageOutlined />}
                        onClick={() => setShowChat(true)}
                        size="large"
                        block
                      >
                        Chat with Seller
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            <Divider />

            <div className="product-stock-info">
              <h3>Availability</h3>
              {product.stock !== undefined ? (
                <div
                  className={`stock-badge ${
                    product.stock > 0 ? 'in-stock' : 'out-of-stock'
                  }`}
                >
                  {product.stock > 0 ? (
                    <span>✓ In Stock ({product.stock} available)</span>
                  ) : (
                    <span>✗ Out of Stock</span>
                  )}
                </div>
              ) : (
                <div className="stock-badge unknown">
                  <span>Stock information unavailable</span>
                </div>
              )}
            </div>

            <Divider />

            <div className="product-actions">
              {!isSeller && result && (
                <div className="action-buttons">
                  {(product.stock || 0) <= 0 ? (
                    <>
                      <Button
                        type="default"
                        size="large"
                        disabled
                        className="add-to-cart-btn"
                      >
                        Out of Stock
                      </Button>
                      <WishlistButton
                        productId={product._id}
                        productTitle={product.title}
                        size="large"
                      />
                    </>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => {
                        if (!result) {
                          message.warning('Please log in to add items to cart');
                          navigate(`/${pageRoutes.login}`);
                          return;
                        }
                        dispatch(addToCart({ productId: product._id }))
                          .unwrap()
                          .then(() => {
                            message.success('Product added to cart');
                            dispatch(fetchMyCart());
                          })
                          .catch((error: any) => {
                            // Don't show error if user is being redirected (interceptor handles it)
                            // The axios interceptor will show a warning and redirect
                            if (error?.response?.status !== 401) {
                              message.error(
                                error?.message || 'Failed to add product to cart'
                              );
                            }
                          });
                      }}
                      className="add-to-cart-btn"
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>
              )}
              {isSeller && (
                <div className="seller-notice">
                  <p className="text-gray-500 italic">
                    Sellers cannot purchase products
                  </p>
                </div>
              )}
              {!result && (
                <div className="login-notice">
                  <p className="text-gray-500 italic">
                    Please log in to add items to cart
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Ratings & Reviews */}
      <div id="product-ratings-section" className="product-detail-bottom">
        <ProductRatings
          productId={product._id}
          productRating={product.rating}
        />
      </div>

      {/* Comments Section */}
      <div id="product-comments-section" className="product-detail-bottom">
        <ProductComments productId={product._id} />
      </div>

      {/* Related Products Section */}
      <div className="product-detail-bottom">
        <RelatedProducts products={relatedProducts} loading={loadingRelated} />
      </div>

      {/* Chat Box */}
      {showChat && (
        <ChatBox
          productId={product._id}
          productTitle={product.title}
          productThumbnail={product.thumbnail}
          productPrice={product.price}
          productSlug={product.slug || product._id}
          sellerId={(product.userID as any)?._id || (product.userID as any)}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
