import { useState } from 'react';
import { Image } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import './ProductImageGallery.scss';

type ProductImageGalleryProps = {
  thumbnail?: string;
  images?: string[];
  productTitle?: string;
};

export const ProductImageGallery = ({
  thumbnail,
  images = [],
  productTitle = 'Product',
}: ProductImageGalleryProps) => {
  // Combine thumbnail and gallery images, filter out empty/undefined values
  const allImages = [thumbnail, ...images].filter((img): img is string => Boolean(img));
  const hasImages = allImages.length > 0;
  
  const [selectedImage, setSelectedImage] = useState(allImages[0] || '');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleZoomClick = (image?: string) => {
    if (!hasImages) return; // Don't zoom placeholder
    if (image) {
      setPreviewImage(image);
    } else {
      setPreviewImage(selectedImage);
    }
    setPreviewVisible(true);
  };

  return (
    <div className="product-image-gallery">
      <div className="main-image-container">
        {hasImages ? (
          <>
            <div className="main-image-wrapper" onClick={() => handleZoomClick(selectedImage)}>
              <Image
                src={selectedImage}
                alt="Product"
                className="main-image"
                preview={false}
              />
              <div className="zoom-overlay">
                <ZoomInOutlined className="zoom-icon" />
                <span>Click to zoom</span>
              </div>
            </div>
            <Image.PreviewGroup>
              {allImages.map((img, index) => (
                <Image
                  key={index}
                  style={{ display: 'none' }}
                  src={img}
                  alt={`Product ${index + 1}`}
                />
              ))}
            </Image.PreviewGroup>
          </>
        ) : (
          <div className="main-image-wrapper placeholder-wrapper">
            <ProductImagePlaceholder title={productTitle} />
          </div>
        )}
      </div>

      {hasImages && allImages.length > 1 && (
        <div className="thumbnail-container">
          {allImages.map((img, index) => (
            <div
              key={index}
              className={`thumbnail-item ${selectedImage === img ? 'active' : ''}`}
              onClick={() => handleImageClick(img)}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                preview={false}
                className="thumbnail-image"
              />
            </div>
          ))}
        </div>
      )}

      {previewVisible && hasImages && (
        <div className="image-preview-modal" onClick={() => setPreviewVisible(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={previewImage}
              alt="Preview"
              className="preview-image"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            />
            <button
              className="close-preview"
              onClick={() => setPreviewVisible(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
