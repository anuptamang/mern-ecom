'use client';

import { Card, List, Image, Button, Tag, Empty, Spin, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { pageRoutes } from '@/data/static/pageRoutes';
import { ProductImage } from '@/components/ProductImage';
import { addToCart, fetchMyCart } from '@/redux/slice/carts/cartsSlice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { message } from 'antd';
import { useState, useRef } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { MESSAGES, LABELS, ROLES } from '@/constants';
import './RelatedProducts.scss';

type RelatedProductsProps = {
  products: any[];
  loading?: boolean;
};

export const RelatedProducts = ({ products, loading = false }: RelatedProductsProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === ROLES.SELLER;
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
      message.warning(MESSAGES.WARNING.SELLERS_CANNOT_PURCHASE);
      return;
    }

    if (stock <= 0) {
      message.error(MESSAGES.ERROR.PRODUCT_OUT_OF_STOCK);
      return;
    }

    try {
      await dispatch(addToCart({ productId })).unwrap();
      message.success(MESSAGES.SUCCESS.PRODUCT_ADDED_TO_CART(title));
      dispatch(fetchMyCart());
    } catch (error: any) {
      // If error is about needing to log in, open auth modal instead of showing error
      const errorMessage = error?.message || error?.payload || String(error);
      if (errorMessage.includes('log in') || errorMessage.includes('Please log in')) {
        setPendingProductId(productId);
        setPendingProductTitle(title);
        setAuthModalVisible(true);
      } else if (error?.response?.status !== 401) {
        message.error(errorMessage || MESSAGES.ERROR.FAILED_TO_ADD_TO_CART);
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
        <div onClick={() => router.push(`/products/${item._id}`)}>
          <ProductImage
            thumbnail={item.thumbnail}
            title={item.title || LABELS.COMMON.PRODUCT}
          />
        </div>
      }
      actions={[
          <Button
            key="view"
            type="link"
            onClick={() => router.push(`/products/${item._id}`)}
          >
            {LABELS.BUTTON.VIEW_DETAILS}
          </Button>,
          !isSeller && result ? (
            <Button
              key="cart"
              type="primary"
              size="small"
              disabled={(item.stock || 0) <= 0}
              onClick={() => handleAddToCart(item._id, item.title, item.stock || 0)}
            >
              {LABELS.BUTTON.ADD_TO_CART}
            </Button>
          ) : !result ? (
            <Button
              key="cart"
              type="primary"
              size="small"
              disabled={(item.stock || 0) <= 0}
              onClick={() => {
                setPendingProductId(item._id);
                setPendingProductTitle(item.title);
                setAuthModalVisible(true);
              }}
            >
              {LABELS.BUTTON.ADD_TO_CART}
            </Button>
          ) : null,
        ]}
      hoverable
    >
      <Card.Meta
        title={item.title}
        description={
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0071e3' }}>
              ${item.price}
            </div>
            {item.stock !== undefined && (
              <Tag color={item.stock > 0 ? 'green' : 'red'}>
                {item.stock > 0 ? `${LABELS.COMMON.IN_STOCK} (${item.stock})` : LABELS.COMMON.OUT_OF_STOCK}
              </Tag>
            )}
          </div>
        }
      />
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty description="No related products found" />
      </div>
    );
  }

  return (
    <>
      <div className="related-products-section">
        <h2>Related Products</h2>
        <div className="related-products-carousel">
          <Carousel
            ref={carouselRef}
            dots={false}
            arrows={true}
            prevArrow={<LeftOutlined />}
            nextArrow={<RightOutlined />}
            slidesToShow={4}
            slidesToScroll={4}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ]}
            beforeChange={(current, next) => setCurrentSlide(next)}
          >
            {products.map((item: any) => (
              <div key={item._id} style={{ padding: '0 8px' }}>
                {renderProductCard(item)}
              </div>
            ))}
          </Carousel>
        </div>
      </div>

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
