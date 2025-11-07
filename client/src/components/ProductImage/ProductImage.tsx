import { useState } from 'react';
import { Image } from 'antd';
import { ProductImagePlaceholder } from '../ProductImageGallery/ProductImagePlaceholder';
import { getImageFormats, generateSrcSet } from '../../utils/imageUtils';
import './ProductImage.scss';

type ProductImageProps = {
  thumbnail?: string | null;
  title?: string;
  className?: string;
  preview?: boolean;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  responsive?: boolean; // Enable responsive images with srcset
  modernFormats?: boolean; // Enable WebP/AVIF support
};

/**
 * ProductImage component with automatic fallback to placeholder
 * Supports responsive images, modern formats (WebP/AVIF), and lazy loading
 * Handles image load errors and displays ProductImagePlaceholder when:
 * - No thumbnail is provided
 * - Image fails to load (network error, CORS, etc.)
 */
export const ProductImage = ({
  thumbnail,
  title = 'Product',
  className = '',
  preview = false,
  width,
  height,
  style,
  responsive = true,
  modernFormats = true,
}: ProductImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // If no thumbnail or error occurred, show placeholder
  if (!thumbnail || imageError) {
    return (
      <div className={`product-image-wrapper ${className}`} style={style}>
        <ProductImagePlaceholder title={title} />
      </div>
    );
  }

  // Generate image formats for modern browsers
  const formats = modernFormats ? getImageFormats(thumbnail, { 
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
  }) : null;

  // Generate srcset for responsive images
  const srcSet = responsive ? generateSrcSet(thumbnail, { format: 'webp' }) : null;
  const srcSetJpeg = responsive ? generateSrcSet(thumbnail, { format: 'jpeg' }) : null;

  // If modern formats are enabled, use <picture> element
  if (modernFormats && formats) {
    return (
      <div className={`product-image-wrapper ${className}`} style={style}>
        <picture>
          {/* AVIF for modern browsers (smallest file size) */}
          {formats.avif && (
            <source
              srcSet={responsive ? generateSrcSet(thumbnail, { format: 'avif' }) || undefined : undefined}
              type="image/avif"
            />
          )}
          {/* WebP for good browser support */}
          {formats.webp && (
            <source
              srcSet={srcSet || undefined}
              type="image/webp"
            />
          )}
          {/* Fallback for all browsers */}
          <img
            src={formats.fallback || thumbnail}
            srcSet={srcSetJpeg || undefined}
            sizes={responsive ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
            alt={title}
            className="product-image"
            width={width}
            height={height}
            style={style}
            loading="lazy"
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />
        </picture>
        {imageLoading && (
          <div className="image-loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
        {preview && (
          <Image.PreviewGroup>
            <Image
              style={{ display: 'none' }}
              src={thumbnail}
              alt={title}
            />
          </Image.PreviewGroup>
        )}
      </div>
    );
  }

  // Fallback to Ant Design Image component for preview support
  return (
    <div className={`product-image-wrapper ${className}`} style={style}>
      <Image
        alt={title}
        src={thumbnail}
        srcSet={srcSet || undefined}
        sizes={responsive ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
        preview={preview}
        className="product-image"
        width={width}
        height={height}
        style={style}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => setImageLoading(false)}
        loading="lazy"
      />
      {imageLoading && (
        <div className="image-loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};
