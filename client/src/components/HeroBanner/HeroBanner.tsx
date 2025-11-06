'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Button, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import {
  FireOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { siteData } from '@/data/static/siteData';
import { MESSAGES, LABELS, BANNER_CONFIG, UI } from '@/constants';
import { getBannerSlidesApi } from '@/services/endPoints/banner';
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
  const router = useRouter();
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
        const { data } = await getBannerSlidesApi();
        if (data?.slides && data.slides.length > 0) {
          setBannerSlides(data.slides);
        } else {
          // Fallback to siteData
          setBannerSlides(siteData.banner.slides || []);
        }
      } catch (error) {
        console.error('Failed to load banner slides:', error);
        // Fallback to siteData
        setBannerSlides(siteData.banner.slides || []);
      }
    };

    loadBannerSlides();
  }, []);

  const handleButtonClick = (slide: BannerSlide) => {
    if (slide.buttonLink) {
      if (slide.productId) {
        router.push(`/products/${slide.productId}`);
      } else if (slide.buttonLink.startsWith('http')) {
        window.open(slide.buttonLink, '_blank');
      } else {
        router.push(slide.buttonLink);
      }
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success(`Voucher code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getBannerIcon = (type: string) => {
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

  if (bannerSlides.length === 0) {
    return null;
  }

  return (
    <div className="hero-banner" style={{ position: 'relative', width: '100%' }}>
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        loop={bannerSlides.length > 1}
        style={{ height: `${maxHeight}px`, minHeight: `${BANNER_CONFIG.SWIPER.DEFAULT_MIN_HEIGHT}px` }}
      >
        {bannerSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`banner-slide banner-slide-${slide.type}`}
              style={{
                height: '100%',
                backgroundImage: slide.image
                  ? `url(${slide.image})`
                  : undefined,
                backgroundColor: slide.backgroundColor || 'var(--theme-primary, #0071e3)',
                color: slide.textColor || 'var(--theme-text-inverse, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  zIndex: 1,
                  padding: '40px 20px',
                  maxWidth: '800px',
                }}
              >
                {slide.discount && (
                  <div style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: slide.textColor || '#ffffff',
                      }}
                    >
                      {slide.discount}
                    </Text>
                  </div>
                )}
                <Title
                  level={1}
                  style={{
                    color: slide.textColor || '#ffffff',
                    marginBottom: 16,
                  }}
                >
                  {getBannerIcon(slide.type)} {slide.title}
                </Title>
                {slide.subtitle && (
                  <Title
                    level={3}
                    style={{
                      color: slide.textColor || '#ffffff',
                      marginBottom: 16,
                    }}
                  >
                    {slide.subtitle}
                  </Title>
                )}
                {slide.description && (
                  <Text
                    style={{
                      fontSize: '18px',
                      color: slide.textColor || '#ffffff',
                      display: 'block',
                      marginBottom: 24,
                    }}
                  >
                    {slide.description}
                  </Text>
                )}
                {slide.voucherCode && (
                  <div style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: slide.textColor || '#ffffff',
                        marginRight: 16,
                      }}
                    >
                      Code: {slide.voucherCode}
                    </Text>
                    <Button
                      type="primary"
                      onClick={() => handleCopyVoucher(slide.voucherCode!)}
                      style={{
                        backgroundColor:
                          copiedCode === slide.voucherCode
                            ? 'var(--theme-success, #52c41a)'
                            : undefined,
                      }}
                    >
                      {copiedCode === slide.voucherCode ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                )}
                {slide.buttonText && (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => handleButtonClick(slide)}
                    style={{
                      backgroundColor: slide.textColor || '#ffffff',
                      color: slide.backgroundColor || '#0071e3',
                      border: 'none',
                    }}
                  >
                    {slide.buttonText}
                  </Button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { HeroBanner };
