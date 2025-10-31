import { Button, Card, Spin, message, Rate, Divider, Tag } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'assets/styles/Common.module.scss';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { addToCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import { fetchProductByIdApi } from 'services/endPoints/products/productsEndpoints';
import {
  ProductImageGallery,
  ProductRatings,
  ProductComments,
} from 'components';
import { EyeOutlined, LikeOutlined } from '@ant-design/icons';
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
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

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

            <Divider />

            <div className="product-actions">
              {!isSeller && result && (
                <Button
                  type="primary"
                  size="large"
                  onClick={() =>
                    dispatch(addToCart({ productId: product._id }))
                  }
                  className="add-to-cart-btn"
                >
                  Add to Cart
                </Button>
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
      <div className="product-detail-bottom">
        <ProductRatings
          productId={product._id}
          productRating={product.rating}
        />
      </div>

      {/* Comments Section */}
      <div className="product-detail-bottom">
        <ProductComments productId={product._id} />
      </div>
    </div>
  );
};
