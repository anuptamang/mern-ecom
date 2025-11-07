/**
 * Cloudflare R2 Storage Utility
 *
 * Cloudflare R2 is S3-compatible object storage with:
 * - No egress fees
 * - Global CDN integration
 * - Automatic image optimization via Cloudflare Images
 *
 * This utility handles uploading files to R2 and generating public URLs.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../config/index.js";

// Initialize S3 client for R2 (R2 is S3-compatible)
// Note: The endpoint should be in format: https://{accountId}.r2.cloudflarestorage.com
// Do NOT include the bucket name in the endpoint
const getR2Endpoint = () => {
  if (process.env.CLOUDFLARE_R2_ENDPOINT) {
    // Use custom endpoint if provided
    let endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    // Ensure it starts with https://
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }
    return endpoint;
  }
  
  // Default endpoint format
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  
  // Fallback - this will likely fail, but at least we'll get a clear error
  return 'https://r2.cloudflarestorage.com';
};

const r2Client = new S3Client({
  region: "auto", // R2 uses 'auto' for region
  endpoint: getR2Endpoint(),
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
  // Disable payload signing for large files (R2 doesn't support it)
  forcePathStyle: false, // R2 uses virtual-hosted style URLs
});

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || ""; // Custom domain or R2.dev URL

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name/key
 * @param {string} contentType - MIME type
 * @param {object} metadata - Optional metadata
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadToR2 = async (
  fileBuffer,
  fileName,
  contentType,
  metadata = {}
) => {
  // Validate required configuration
  if (!R2_BUCKET) {
    throw new Error('R2: CLOUDFLARE_R2_BUCKET_NAME is not configured');
  }
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error('R2: CLOUDFLARE_R2_ACCESS_KEY_ID or CLOUDFLARE_R2_SECRET_ACCESS_KEY is not configured');
  }

  // Validate endpoint format (should not include bucket name)
  const endpoint = getR2Endpoint();
  if (endpoint.includes(R2_BUCKET)) {
    console.warn(`R2 Warning: Endpoint appears to include bucket name. Endpoint should be: https://{accountId}.r2.cloudflarestorage.com (without bucket name)`);
  }

  try {
    const key = `uploads/${fileName}`;

    // Build command parameters - R2 is very strict about what parameters it accepts
    const commandParams = {
      Bucket: R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    };

    // Only add Metadata if it's not empty and doesn't contain problematic keys
    // R2 may have issues with certain metadata keys, so we filter them
    if (metadata && Object.keys(metadata).length > 0) {
      // Filter out any metadata that might cause signature issues
      const safeMetadata = {};
      for (const [key, value] of Object.entries(metadata)) {
        // Only include simple string values
        if (typeof value === 'string' && value.length > 0) {
          safeMetadata[key] = value;
        }
      }
      if (Object.keys(safeMetadata).length > 0) {
        commandParams.Metadata = safeMetadata;
      }
    }

    const command = new PutObjectCommand(commandParams);

    await r2Client.send(command);

    // Generate public URL
    // Note: For R2, public access must be enabled at the bucket level in Cloudflare Dashboard
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;

    return publicUrl;
  } catch (error) {
    // Provide more helpful error messages
    if (error.name === 'SignatureDoesNotMatch') {
      const endpoint = getR2Endpoint();
      const errorMsg = `R2 authentication failed: ${error.message}. 
Please check:
1. CLOUDFLARE_R2_ACCESS_KEY_ID and CLOUDFLARE_R2_SECRET_ACCESS_KEY are correct
2. Endpoint format is correct: ${endpoint} (should be https://{accountId}.r2.cloudflarestorage.com, NOT including bucket name)
3. No extra spaces or quotes in your .env file
4. CLOUDFLARE_ACCOUNT_ID is correct (if using default endpoint)`;
      throw new Error(errorMsg);
    }
    if (error.name === 'NoSuchBucket') {
      throw new Error(`R2 bucket not found: ${R2_BUCKET}. Please check your CLOUDFLARE_R2_BUCKET_NAME.`);
    }
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error(`R2 access denied: ${error.message}. Please check your R2 credentials and bucket permissions.`);
    }
    
    console.error("Error uploading to R2:", error);
    throw new Error(`Failed to upload file to R2: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} fileName - File name/key
 * @returns {Promise<void>}
 */
export const deleteFromR2 = async (fileName) => {
  try {
    const key = `uploads/${fileName}`;

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error(`Failed to delete file from R2: ${error.message}`);
  }
};

/**
 * Check if a file exists in R2
 * @param {string} fileName - File name/key
 * @returns {Promise<boolean>}
 */
export const fileExistsInR2 = async (fileName) => {
  try {
    const key = `uploads/${fileName}`;

    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Get the public URL for a file in R2
 * @param {string} fileName - File name/key
 * @returns {string} Public URL
 */
export const getR2PublicUrl = (fileName) => {
  const key = `uploads/${fileName}`;

  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }

  // Fallback to R2.dev URL
  return `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${key}`;
};

/**
 * Check if Cloudflare R2 is configured
 * @returns {boolean}
 */
export const isR2Configured = () => {
  // Only require bucket name and credentials for basic functionality
  // Account ID is only needed for public URL generation (R2.dev URLs)
  return !!(
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    R2_BUCKET
  );
};
