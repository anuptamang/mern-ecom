/**
 * Image Transformation Utility
 * 
 * Provides a unified interface for generating optimized image URLs
 * Supports both Cloudflare Images and fallback to R2/direct URLs
 */

import { getOptimizedImageUrl, generateSrcSet, isCloudflareImagesConfigured } from './cloudflareImages.js';
import { getR2PublicUrl, isR2Configured } from './cloudflareR2.js';
import config from '../config/index.js';

/**
 * Get optimized image URL with transformations
 * @param {string} imageId - Image ID (Cloudflare Images ID or file name)
 * @param {object} options - Transformation options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.fit - Fit mode: 'scale-down', 'contain', 'cover', 'crop', 'pad'
 * @param {string} options.format - Output format: 'webp', 'avif', 'jpeg', 'png'
 * @param {number} options.quality - Image quality (1-100)
 * @returns {string} Optimized image URL
 */
export const getImageUrl = (imageId, options = {}) => {
  // If Cloudflare Images is configured, use it
  if (isCloudflareImagesConfigured()) {
    return getOptimizedImageUrl(imageId, options);
  }

  // Fallback to R2 or direct URL
  if (isR2Configured()) {
    const url = getR2PublicUrl(imageId);
    // If R2 is used, we can still add query params for future optimization
    // For now, return the direct URL
    return url;
  }

  // Final fallback to local storage
  return `${config.upload.imageBucketUrl}/${imageId}`;
};

/**
 * Generate responsive image srcset
 * @param {string} imageId - Image ID
 * @param {object} options - Base options
 * @param {string} options.format - Output format
 * @param {number[]} widths - Array of widths for srcset
 * @returns {string} srcset string
 */
export const getImageSrcSet = (imageId, options = {}) => {
  // If Cloudflare Images is configured, use it
  if (isCloudflareImagesConfigured()) {
    return generateSrcSet(imageId, options);
  }

  // For R2 or local storage, generate basic srcset with query params
  const { widths = [400, 800, 1200, 1600], format } = options;
  const baseUrl = isR2Configured() 
    ? getR2PublicUrl(imageId)
    : `${config.upload.imageBucketUrl}/${imageId}`;

  return widths
    .map(width => {
      const params = new URLSearchParams({ w: width.toString() });
      if (format) params.set('format', format);
      return `${baseUrl}?${params.toString()} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate image URLs for different formats (for <picture> element)
 * @param {string} imageId - Image ID
 * @param {object} options - Base options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @returns {object} Object with avif, webp, and fallback URLs
 */
export const getImageFormats = (imageId, options = {}) => {
  const { width, height } = options;

  if (isCloudflareImagesConfigured()) {
    return {
      avif: getOptimizedImageUrl(imageId, { ...options, format: 'avif', width, height }),
      webp: getOptimizedImageUrl(imageId, { ...options, format: 'webp', width, height }),
      fallback: getOptimizedImageUrl(imageId, { ...options, format: 'jpeg', width, height }),
    };
  }

  // Fallback: return same URL for all formats (no optimization)
  const baseUrl = getImageUrl(imageId, options);
  return {
    avif: baseUrl,
    webp: baseUrl,
    fallback: baseUrl,
  };
};

/**
 * Extract image ID from full URL
 * @param {string} url - Full image URL
 * @returns {string} Image ID or filename
 */
export const extractImageId = (url) => {
  if (!url) return null;
  
  // If it's a Cloudflare Images URL, extract the ID
  const cloudflareMatch = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  if (cloudflareMatch) {
    return cloudflareMatch[1];
  }

  // If it's an R2 URL, extract the filename
  const r2Match = url.match(/uploads\/([^/?]+)/);
  if (r2Match) {
    return r2Match[1];
  }

  // If it's a local URL, extract the filename
  const localMatch = url.match(/\/([^/?]+)$/);
  if (localMatch) {
    return localMatch[1];
  }

  // Return as-is if no pattern matches
  return url;
};
