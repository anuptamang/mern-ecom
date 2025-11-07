/**
 * Cloudflare Images API Utility
 * 
 * Cloudflare Images provides:
 * - Automatic image optimization
 * - On-the-fly transformations (resize, format conversion)
 * - WebP/AVIF format support
 * - Global CDN delivery
 * 
 * This utility handles uploading images to Cloudflare Images and generating optimized URLs.
 */

import FormData from 'form-data';
import config from '../config/index.js';

const CLOUDFLARE_IMAGES_API_URL = 'https://api.cloudflare.com/client/v4';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_IMAGES_API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN || '';
const CLOUDFLARE_IMAGES_ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH || '';

/**
 * Upload an image to Cloudflare Images
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} fileName - Original file name
 * @param {string} contentType - MIME type
 * @returns {Promise<{id: string, filename: string, uploaded: string, requireSignedURLs: boolean, variants: string[]}>}
 */
export const uploadToCloudflareImages = async (imageBuffer, fileName, contentType) => {
  // Validate required credentials
  if (!CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Cloudflare Images: CLOUDFLARE_ACCOUNT_ID is not configured');
  }
  if (!CLOUDFLARE_IMAGES_API_TOKEN) {
    throw new Error('Cloudflare Images: CLOUDFLARE_IMAGES_API_TOKEN is not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: fileName,
      contentType: contentType,
    });
    formData.append('requireSignedURLs', 'false'); // Make images publicly accessible

    const url = `${CLOUDFLARE_IMAGES_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;
    const headers = {
      'Authorization': `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
      ...formData.getHeaders(), // Get headers including boundary
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.errors?.[0]?.message || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
      
      // Provide more helpful error messages
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Cloudflare Images authentication failed: ${errorMessage}. Please check your CLOUDFLARE_IMAGES_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.`);
      }
      
      throw new Error(`Cloudflare Images API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Cloudflare Images API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
    }
    
    return data.result;
  } catch (error) {
    // Don't log if it's a configuration error (we want to fallback gracefully)
    if (error.message.includes('is not configured')) {
      throw error;
    }
    
    console.error('Error uploading to Cloudflare Images:', error.message);
    throw new Error(`Failed to upload image to Cloudflare Images: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudflare Images
 * @param {string} imageId - Cloudflare Images ID
 * @returns {Promise<void>}
 */
export const deleteFromCloudflareImages = async (imageId) => {
  try {
    const response = await fetch(
      `${CLOUDFLARE_IMAGES_API_URL}/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_IMAGES_API_TOKEN}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(`Cloudflare Images API error: ${error.errors?.[0]?.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting from Cloudflare Images:', error);
    throw new Error(`Failed to delete image from Cloudflare Images: ${error.message}`);
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} imageId - Cloudflare Images ID or variant name
 * @param {object} options - Transformation options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.fit - Fit mode: 'scale-down', 'contain', 'cover', 'crop', 'pad'
 * @param {string} options.format - Output format: 'webp', 'avif', 'jpeg', 'png'
 * @param {number} options.quality - Image quality (1-100)
 * @param {boolean} options.sharpen - Apply sharpening
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (imageId, options = {}) => {
  const {
    width,
    height,
    fit = 'cover',
    format = 'webp',
    quality = 85,
    sharpen = false,
  } = options;

  // Base URL for Cloudflare Images
  const baseUrl = `https://imagedelivery.net/${CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imageId}`;
  
  // Build variant name from options
  const variantParts = [];
  if (width) variantParts.push(`w${width}`);
  if (height) variantParts.push(`h${height}`);
  variantParts.push(fit);
  if (format !== 'jpeg') variantParts.push(format);
  if (quality !== 85) variantParts.push(`q${quality}`);
  if (sharpen) variantParts.push('sharpen');

  const variant = variantParts.length > 0 ? variantParts.join('-') : 'public';
  
  return `${baseUrl}/${variant}`;
};

/**
 * Generate responsive image srcset
 * @param {string} imageId - Cloudflare Images ID
 * @param {object} options - Base options
 * @param {string} options.format - Output format
 * @param {number[]} widths - Array of widths for srcset
 * @returns {string} srcset string
 */
export const generateSrcSet = (imageId, options = {}) => {
  const { format = 'webp', widths = [400, 800, 1200, 1600] } = options;
  
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(imageId, { ...options, width, format });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Check if Cloudflare Images is configured
 * @returns {boolean}
 */
export const isCloudflareImagesConfigured = () => {
  // Only require account ID and API token for basic functionality
  // Account hash is only needed for URL generation, not for uploads
  return !!(
    CLOUDFLARE_ACCOUNT_ID &&
    CLOUDFLARE_IMAGES_API_TOKEN
  );
};
