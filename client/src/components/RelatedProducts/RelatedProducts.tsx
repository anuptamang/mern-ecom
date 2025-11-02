import { Card, List, Image, Button, Tag, Empty, Spin, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { message } from 'antd';
import { useState, useRef } from 'react';
import { AuthModal } from 'components/AuthModal';
import './RelatedProducts.scss';

type RelatedProductsProps = {
  products: any[];
  loading?: boolean;
};

export const RelatedProducts = ({ products, loading = false }: RelatedProductsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const carouselRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingProductTitle, setPendingProductTitle] = useState<string>('');

  const handleAddToCart = async (productId: string, title: string, stock: number) => {
    if (!result) {
      setPendingProductId(productId);
      setPendingProductTitle(title);
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

    try {
      await dispatch(addToCart({ productId })).unwrap();
      message.success(`${title} added to cart`);
      dispatch(fetchMyCart());
    } catch (error: any) {
      // If error is about needing to log in, open auth modal instead of showing error
      const errorMessage = error?.message || error?.payload || String(error);
      if (errorMessage.includes('log in') || errorMessage.includes('Please log in')) {
        setPendingProductId(productId);
        setPendingProductTitle(title);
        setAuthModalVisible(true);
      } else if (error?.response?.status !== 401) {
        message.error(errorMessage || 'Failed to add product to cart');
      }
    }
  };

  const handleAuthSuccess = async () => {
    if (pendingProductId && pendingProductTitle) {
      // Find the product to get stock info
      const product = products.find(p => p._id === pendingProductId);
      if (product) {
        await handleAddToCart(pendingProductId, pendingProductTitle, product.stock || 0);
      }
    }
  };

  const renderProductCard = (item: any) => (
    <Card
      className="related-product-card"
      cover={
        item.thumbnail ? (
          <div className="product-image-wrapper" onClick={() => navigate(`/products/${item._id}`)}>
            <Image
              alt={item.title}
              src={item.thumbnail}
              preview={false}
              className="product-image"
            />
          </div>
        ) : (
          <div className="product-image-wrapper" onClick={() => navigate(`/products/${item._id}`)}>
            <ProductImagePlaceholder title={item.title || 'Product'} />
          </div>
        )
      }
      actions={[
        <Button
          key="view"
          type="link"
          onClick={() => navigate(`/products/${item._id}`)}
        >
          View
        </Button>,
        !isSeller && result ? (
          <Button
            key="cart"
            type="primary"
            size="small"
            disabled={(item.stock || 0) <= 0}
            onClick={() => handleAddToCart(item._id, item.title, item.stock || 0)}
          >
            Add to Cart
          </Button>
        ) : null,
      ].filter(Boolean)}
      hoverable
    >
      <Card.Meta
        title={
          <div onClick={() => navigate(`/products/${item._id}`)} style={{ cursor: 'pointer' }}>
            {item.title}
          </div>
        }
        description={
          <div className="related-product-meta">
            {item.body?.summary || item.description || ''}
            {item.price && (
              <div className="related-product-price">${item.price.toFixed(2)}</div>
            )}
            <div className="related-product-stock">
              {item.stock !== undefined ? (
                <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                  {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                </span>
              ) : null}
            </div>
          </div>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div className="related-products">
        <Card title="Related Products" className="related-products-card">
          <Spin tip="Loading related products..." />
        </Card>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  // If more than 4 products, use carousel/swiper
  const useCarousel = products.length > 4;

  // Group products into slides of 4
  const slides: any[][] = [];
  if (useCarousel) {
    for (let i = 0; i < products.length; i += 4) {
      slides.push(products.slice(i, i + 4));
    }
  }

  return (
    <div className="related-products">
      <Card 
        title="Related Products" 
        className="related-products-card"
        extra={
          useCarousel && (
            <div className="carousel-controls">
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                disabled={currentSlide === 0}
              />
              <Button
                type="text"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                disabled={currentSlide >= slides.length - 1}
              />
            </div>
          )
        }
      >
        {useCarousel ? (
          <Carousel
            ref={carouselRef}
            dots={false}
            beforeChange={(_, next) => setCurrentSlide(next)}
            className="related-products-carousel"
          >
            {slides.map((slideProducts, slideIndex) => (
              <div key={slideIndex} className="carousel-slide">
                <div className="products-grid">
                  {slideProducts.map((item: any) => (
                    <div key={item._id} className="product-grid-item">
                      {renderProductCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="products-grid">
            {products.map((item: any) => (
              <div key={item._id} className="product-grid-item">
                {renderProductCard(item)}
              </div>
            ))}
          </div>
        )}
      </Card>

      <AuthModal
        open={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingProductId(null);
          setPendingProductTitle('');
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
