/**
 * Image Utility Functions
 *
 * Provides utilities for generating optimized image URLs with Cloudflare Images
 * Supports responsive images, modern formats (WebP/AVIF), and transformations
 */

/**
 * Extract image ID from Cloudflare Images URL
 * @param url - Full image URL
 * @returns Image ID or null
 */
export const extractImageId = (
  url: string | null | undefined
): string | null => {
  if (!url) return null;

  // Cloudflare Images URL pattern: https://imagedelivery.net/{accountHash}/{imageId}/{variant}
  const cloudflareMatch = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  if (cloudflareMatch) {
    return cloudflareMatch[1];
  }

  // R2 URL pattern: https://{domain}/uploads/{filename}
  const r2Match = url.match(/uploads\/([^/?]+)/);
  if (r2Match) {
    return r2Match[1];
  }

  // Local URL pattern: /uploads/{filename} or {domain}/uploads/{filename}
  const localMatch = url.match(/\/([^/?]+)$/);
  if (localMatch) {
    return localMatch[1];
  }

  return url;
};

/**
 * Generate optimized image URL with Cloudflare Images transformations
 * @param imageId - Image ID or URL
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  imageId: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    quality?: number;
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  } = {}
): string | null => {
  if (!imageId) return null;

  const {
    width,
    height,
    format = 'webp',
    quality = 85,
    fit = 'cover',
  } = options;

  // If it's already a Cloudflare Images URL, extract ID and rebuild
  const id = extractImageId(imageId);
  if (!id) return imageId;

  // Check if it's a Cloudflare Images URL (has imagedelivery.net)
  if (imageId.includes('imagedelivery.net')) {
    const accountHashMatch = imageId.match(/imagedelivery\.net\/([^/]+)/);
    if (accountHashMatch) {
      const accountHash = accountHashMatch[1];
      const variantParts: string[] = [];

      if (width) variantParts.push(`w${width}`);
      if (height) variantParts.push(`h${height}`);
      variantParts.push(fit);
      if (format !== 'jpeg') variantParts.push(format);
      if (quality !== 85) variantParts.push(`q${quality}`);

      const variant =
        variantParts.length > 0 ? variantParts.join('-') : 'public';
      return `https://imagedelivery.net/${accountHash}/${id}/${variant}`;
    }
  }

  // For R2 or local URLs, only add query parameters if it's an R2 URL
  // Local URLs (localhost) don't support transformations, so skip them
  const isLocalUrl = imageId.includes('localhost') || imageId.includes('127.0.0.1');
  
  if (isLocalUrl) {
    // For local URLs, return as-is without transformation parameters
    // Local server doesn't support image transformations
    return imageId;
  }

  // For R2 URLs, add query parameters for future optimization
  // (R2 itself doesn't support transformations, but we can add params for future CDN optimization)
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (format !== 'jpeg') params.set('format', format);
  if (quality !== 85) params.set('quality', quality.toString());
  params.set('fit', fit);

  // If it's a full URL, add params; otherwise return as-is
  if (imageId.startsWith('http')) {
    return `${imageId}?${params.toString()}`;
  }

  return imageId;
};

/**
 * Generate responsive image srcset
 * @param imageId - Image ID or URL
 * @param options - Base options
 * @returns srcset string
 */
export const generateSrcSet = (
  imageId: string | null | undefined,
  options: {
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    widths?: number[];
  } = {}
): string | null => {
  if (!imageId) return null;

  const { format = 'webp', widths = [400, 800, 1200, 1600] } = options;

  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(imageId, { width, format });
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean)
    .join(', ');
};

/**
 * Generate image URLs for different formats (for <picture> element)
 * @param imageId - Image ID or URL
 * @param options - Base options
 * @returns Object with avif, webp, and fallback URLs
 */
export const getImageFormats = (
  imageId: string | null | undefined,
  options: {
    width?: number;
    height?: number;
  } = {}
): {
  avif: string | null;
  webp: string | null;
  fallback: string | null;
} => {
  if (!imageId) {
    return { avif: null, webp: null, fallback: null };
  }

  const { width, height } = options;

  return {
    avif: getOptimizedImageUrl(imageId, {
      ...options,
      format: 'avif',
      width,
      height,
    }),
    webp: getOptimizedImageUrl(imageId, {
      ...options,
      format: 'webp',
      width,
      height,
    }),
    fallback: getOptimizedImageUrl(imageId, {
      ...options,
      format: 'jpeg',
      width,
      height,
    }),
  };
};
