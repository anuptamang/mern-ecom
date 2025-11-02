import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FireOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { siteData } from 'data/static/siteData';
import { MESSAGES, LABELS, BANNER_CONFIG, UI } from '../../constants';
import { getBannerSlidesApi } from 'services/endPoints/banner';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './HeroBanner.scss';

const { Title, Text } = Typography;

interface BannerSlide {
  id: string;
  type: 'offer' | 'voucher' | 'coming-soon' | 'featured' | 'banner';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  discount?: string;
  voucherCode?: string;
  productId?: string;
}

const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);
  const [maxHeight, setMaxHeight] = useState<number>(
    Number(BANNER_CONFIG.SWIPER.DEFAULT_MIN_HEIGHT)
  );
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>([]);

  // Fetch banner slides from API, fallback to siteData
  useEffect(() => {
    const loadBannerSlides = async () => {
      try {
        const { data } = await getBannerSlidesApi({ isActive: true });
        if (data.slides && data.slides.length > 0) {
          setBannerSlides(data.slides as BannerSlide[]);
        } else {
          // Fallback to siteData
          setBannerSlides(
            (siteData.bannerSlides || [
              {
                id: '1',
                type: 'offer',
                title: 'Summer Sale',
                subtitle: 'Up to 50% OFF',
                description: 'Discover amazing deals on summer essentials',
                backgroundColor: '#ff6b6b',
                textColor: '#fff',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                discount: '50%',
              },
              {
                id: '2',
                type: 'voucher',
                title: 'Get Your Voucher',
                subtitle: 'SAVE20',
                description:
                  'Use code SAVE20 to get 20% off on your next purchase',
                backgroundColor: '#4ecdc4',
                textColor: '#fff',
                buttonText: 'Copy Code',
                voucherCode: 'SAVE20',
              },
              {
                id: '3',
                type: 'featured',
                title: 'Featured Products',
                subtitle: 'Best Sellers',
                description: 'Check out our top-rated products this week',
                backgroundColor: '#45b7d1',
                textColor: '#fff',
                buttonText: 'View Products',
                buttonLink: '/products',
              },
              {
                id: '4',
                type: 'coming-soon',
                title: 'Coming Soon',
                subtitle: 'New Collection',
                description: 'Exciting new products launching next week!',
                backgroundColor: '#f39c12',
                textColor: '#fff',
                buttonText: 'Notify Me',
              },
              {
                id: '5',
                type: 'banner',
                title: 'Free Shipping',
                subtitle: 'On Orders Over $100',
                description: 'Shop now and enjoy free shipping on all orders',
                backgroundColor: '#9b59b6',
                textColor: '#fff',
                buttonText: 'Shop Now',
                buttonLink: '/products',
              },
              {
                id: '6',
                type: 'offer',
                title: 'Flash Sale',
                subtitle: 'Limited Time',
                description: "Limited time offer - don't miss out!",
                backgroundColor: '#e74c3c',
                textColor: '#fff',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                discount: '30%',
              },
            ]) as BannerSlide[]
          );
        }
      } catch (error) {
        console.error('Failed to load banner slides, using fallback:', error);
        // Fallback to siteData on error
        setBannerSlides((siteData.bannerSlides || []) as BannerSlide[]);
      }
    };

    loadBannerSlides();
  }, []);

  useEffect(() => {
    // Calculate the maximum height among all slides
    const calculateMaxHeight = () => {
      const slides = document.querySelectorAll(UI.SELECTORS.BANNER_SLIDE);
      let max = Number(BANNER_CONFIG.SWIPER.DEFAULT_MIN_HEIGHT);

      slides.forEach((slide) => {
        const height = slide.scrollHeight;
        if (height > max) {
          max = height;
        }
      });

      setMaxHeight(max);
    };

    // Calculate on mount and after images/content load
    calculateMaxHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateMaxHeight);

    // Use MutationObserver to detect content changes
    const observer = new MutationObserver(calculateMaxHeight);
    const swiperContainer = document.querySelector(UI.SELECTORS.HERO_SWIPER);
    if (swiperContainer) {
      observer.observe(swiperContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }

    return () => {
      window.removeEventListener('resize', calculateMaxHeight);
      observer.disconnect();
    };
  }, []);

  const handleSlideClick = async (slide: BannerSlide) => {
    if (slide.buttonLink) {
      navigate(slide.buttonLink);
    } else if (slide.voucherCode) {
      // Copy voucher code to clipboard
      try {
        await navigator.clipboard.writeText(slide.voucherCode);
        setCopiedCode(slide.voucherCode);
        message.success(
          MESSAGES.SUCCESS.VOUCHER_CODE_COPIED(slide.voucherCode)
        );
        setTimeout(
          () => setCopiedCode(null),
          BANNER_CONFIG.SWIPER.COPY_CODE_TIMEOUT
        );
      } catch (err) {
        message.error(MESSAGES.ERROR.FAILED_TO_COPY_VOUCHER);
      }
    }
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <FireOutlined />;
      case 'voucher':
        return <GiftOutlined />;
      case 'coming-soon':
        return <ClockCircleOutlined />;
      case 'featured':
        return <StarOutlined />;
      default:
        return <ShoppingOutlined />;
    }
  };

  return (
    <div className="hero-banner">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: BANNER_CONFIG.SWIPER.DELAY,
          disableOnInteraction: BANNER_CONFIG.SWIPER.DISABLE_ON_INTERACTION,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        className="hero-swiper"
        style={{ height: `${maxHeight}px` }}
        onSlideChange={() => {
          // Recalculate height when slide changes
          setTimeout(() => {
            const slides = document.querySelectorAll(UI.SELECTORS.BANNER_SLIDE);
            let max = Number(BANNER_CONFIG.SWIPER.DEFAULT_MIN_HEIGHT);
            slides.forEach((slide) => {
              const height = slide.scrollHeight;
              if (height > max) {
                max = height;
              }
            });
            setMaxHeight(max);
          }, BANNER_CONFIG.SWIPER.RECALCULATE_DELAY);
        }}
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="banner-slide"
              style={{
                backgroundColor: slide.backgroundColor || '#1890ff',
                color: slide.textColor || '#fff',
              }}
            >
              <div className="banner-content">
                <div className="banner-icon">{getSlideIcon(slide.type)}</div>

                {slide.discount && (
                  <div className="banner-discount">
                    <Text className="discount-text">
                      {slide.discount} {LABELS.COMMON.DISCOUNT}
                    </Text>
                  </div>
                )}

                {slide.voucherCode && (
                  <div className="banner-voucher">
                    <Text
                      className={`voucher-code ${
                        copiedCode === slide.voucherCode ? 'copied' : ''
                      }`}
                    >
                      {slide.voucherCode}
                    </Text>
                    {copiedCode === slide.voucherCode && (
                      <Text className="copied-indicator">
                        {LABELS.COMMON.COPIED}
                      </Text>
                    )}
                  </div>
                )}

                <Title level={1} className="banner-title">
                  {slide.title}
                </Title>

                {slide.subtitle && (
                  <Title level={2} className="banner-subtitle">
                    {slide.subtitle}
                  </Title>
                )}

                {slide.description && (
                  <Text className="banner-description">
                    {slide.description}
                  </Text>
                )}

                {slide.buttonText && (
                  <Button
                    type="primary"
                    size="large"
                    className="banner-button"
                    onClick={() => handleSlideClick(slide)}
                    style={{
                      backgroundColor:
                        slide.textColor === '#fff' ? '#fff' : '#1890ff',
                      color: slide.backgroundColor || '#1890ff',
                      border: 'none',
                      marginTop: '24px',
                    }}
                  >
                    {slide.buttonText}
                  </Button>
                )}
              </div>

              {slide.type === BANNER_CONFIG.SLIDE_TYPES.COMING_SOON && (
                <div className="coming-soon-badge">
                  <ClockCircleOutlined /> {LABELS.BANNER.COMING_SOON}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroBanner;
