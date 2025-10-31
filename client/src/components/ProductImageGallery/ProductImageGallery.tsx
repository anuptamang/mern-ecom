import { useState } from 'react';
import { Image } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';
import './ProductImageGallery.scss';

type ProductImageGalleryProps = {
  thumbnail: string;
  images?: string[];
};

export const ProductImageGallery = ({
  thumbnail,
  images = [],
}: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(thumbnail);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Combine thumbnail and gallery images
  const allImages = [thumbnail, ...images].filter(Boolean);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleZoomClick = (image: string) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  return (
    <div className="product-image-gallery">
      <div className="main-image-container">
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
      </div>

      {allImages.length > 1 && (
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

      {previewVisible && (
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
