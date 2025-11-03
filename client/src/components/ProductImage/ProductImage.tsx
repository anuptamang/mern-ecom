import { useState } from 'react';
import { Image } from 'antd';
import { ProductImagePlaceholder } from '../ProductImageGallery/ProductImagePlaceholder';
import './ProductImage.scss';

type ProductImageProps = {
  thumbnail?: string | null;
  title?: string;
  className?: string;
  preview?: boolean;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
};

/**
 * ProductImage component with automatic fallback to placeholder
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

  return (
    <div className={`product-image-wrapper ${className}`} style={style}>
      <Image
        alt={title}
        src={thumbnail}
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
