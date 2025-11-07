/**
 * Cloudflare Upload Middleware
 *
 * Handles file uploads to Cloudflare R2 and/or Cloudflare Images
 * Falls back to local storage if Cloudflare is not configured
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadToR2, isR2Configured } from "../utils/cloudflareR2.js";
import {
  uploadToCloudflareImages,
  isCloudflareImagesConfigured,
} from "../utils/cloudflareImages.js";
import config from "../config/index.js";

// Memory storage for processing files before upload to Cloudflare
const memoryStorage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
}

// Create multer instance with memory storage
const multerInstance = multer({
  storage: memoryStorage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

/**
 * Middleware to upload file to Cloudflare after multer processing
 */
export const uploadToCloudflare = async (req, res, next) => {
  // If no file was uploaded, skip
  if (!req.file && !req.files) {
    return next();
  }

  try {
    // When using .fields(), all files are in req.files, not req.file
    // So we should process req.files first, then req.file as fallback
    // Handle multiple files upload (including .fields() format)
    if (req.files) {
      // Handle both array format and object format (from .fields())
      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      // Process files sequentially to avoid R2 client conflicts
      // Note: Processing in parallel can cause signature issues with R2
      // Process thumbnail first, then gallery images
      const thumbnailFiles = files.filter((f) => f.fieldname === "thumbnail");
      const otherFiles = files.filter((f) => f.fieldname !== "thumbnail");
      const orderedFiles = [...thumbnailFiles, ...otherFiles];

      for (const file of orderedFiles) {
        // Generate unique filename with timestamp and fieldname
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const fileName = `${
          file.fieldname
        }-${timestamp}-${randomSuffix}${path.extname(file.originalname)}`;

        let imageUrl = null;
        let imageId = null;

        console.log(
          `[${file.fieldname}] Processing file: ${fileName}, size: ${file.size} bytes`
        );

        // Try Cloudflare Images first
        if (isCloudflareImagesConfigured()) {
          try {
            const result = await uploadToCloudflareImages(
              file.buffer,
              fileName,
              file.mimetype
            );
            imageId = result.id;
            const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
            if (accountHash && result.id) {
              imageUrl =
                result.variants?.[0] ||
                `https://imagedelivery.net/${accountHash}/${result.id}/public`;
            } else if (result.id) {
              imageUrl = result.variants?.[0] || null;
              console.warn(
                `[${file.fieldname}] Cloudflare Images: CLOUDFLARE_IMAGES_ACCOUNT_HASH not set. Image uploaded but URL generation may fail.`
              );
            }
          } catch (error) {
            // Only log if it's not a configuration error (we want to fallback silently)
            if (!error.message.includes("is not configured")) {
              console.warn(
                `[${file.fieldname}] Cloudflare Images upload failed, falling back to R2:`,
                error.message
              );
            }
          }
        }

        // Try R2 with retry logic for thumbnail (first upload might fail due to R2 client initialization)
        if (!imageUrl && isR2Configured()) {
          // Thumbnail is processed first, so add a small delay to ensure R2 client is ready
          if (file.fieldname === "thumbnail") {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          let retryCount = file.fieldname === "thumbnail" ? 3 : 1; // Retry thumbnail upload more times
          let lastError = null;

          while (retryCount > 0 && !imageUrl) {
            try {
              imageUrl = await uploadToR2(
                file.buffer,
                fileName,
                file.mimetype,
                {
                  originalname: file.originalname,
                  size: file.size.toString(),
                }
              );
              imageId = fileName;
              console.log(
                `[${file.fieldname}] Successfully uploaded to R2: ${imageUrl}`
              );
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error;
              retryCount--;

              if (retryCount > 0) {
                // Add delay before retry
                await new Promise((resolve) => setTimeout(resolve, 200));
                console.warn(
                  `[${file.fieldname}] R2 upload failed, retrying... (${retryCount} attempts left):`,
                  error.message
                );
              } else {
                console.warn(
                  `[${file.fieldname}] R2 upload failed after retries, falling back to local storage:`,
                  error.message
                );
                // Log full error for debugging
                if (error.stack) {
                  console.error(
                    `[${file.fieldname}] R2 upload error stack:`,
                    error.stack
                  );
                }
              }
            }
          }
        }

        // Fallback to local storage
        if (!imageUrl) {
          const uploadPath = config.upload.uploadPath;
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          const localFileName = fileName;
          const localPath = path.join(uploadPath, localFileName);
          fs.writeFileSync(localPath, file.buffer);

          imageUrl = `${config.upload.imageBucketUrl}/${localFileName}`;
          imageId = localFileName;
          console.log(`[${file.fieldname}] Using local storage: ${imageUrl}`);
        }

        // Attach image info to file object
        file.cloudflareUrl = imageUrl;
        file.cloudflareId = imageId;
        file.url = imageUrl;
        file.filename = fileName; // Ensure filename is set
      }
    }

    // Handle single file upload (fallback for .single() usage)
    if (req.file) {
      const file = req.file;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const fileName = `${
        file.fieldname
      }-${timestamp}-${randomSuffix}${path.extname(file.originalname)}`;

      let imageUrl = null;
      let imageId = null;

      // Try Cloudflare Images first (if configured)
      if (isCloudflareImagesConfigured()) {
        try {
          const result = await uploadToCloudflareImages(
            file.buffer,
            fileName,
            file.mimetype
          );
          imageId = result.id;
          // Use the public variant URL
          const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
          if (accountHash && result.id) {
            imageUrl =
              result.variants?.[0] ||
              `https://imagedelivery.net/${accountHash}/${result.id}/public`;
          } else if (result.id) {
            // If account hash is not set, we can't generate the URL yet
            // Store the ID and generate URL later when hash is available
            imageUrl = result.variants?.[0] || null;
            console.warn(
              `[${file.fieldname}] Cloudflare Images: CLOUDFLARE_IMAGES_ACCOUNT_HASH not set. Image uploaded but URL generation may fail.`
            );
          }
        } catch (error) {
          // Only log if it's not a configuration error (we want to fallback silently)
          if (!error.message.includes("is not configured")) {
            console.warn(
              `[${file.fieldname}] Cloudflare Images upload failed, falling back to R2:`,
              error.message
            );
          }
        }
      }

      // If Cloudflare Images failed or not configured, try R2
      if (!imageUrl && isR2Configured()) {
        try {
          imageUrl = await uploadToR2(file.buffer, fileName, file.mimetype, {
            originalname: file.originalname,
            size: file.size.toString(),
          });
          imageId = fileName; // Use filename as ID for R2
          console.log(
            `[${file.fieldname}] Successfully uploaded to R2: ${imageUrl}`
          );
        } catch (error) {
          console.warn(
            `[${file.fieldname}] R2 upload failed, falling back to local storage:`,
            error.message
          );
          // Log full error for debugging
          if (error.stack) {
            console.error(
              `[${file.fieldname}] R2 upload error stack:`,
              error.stack
            );
          }
        }
      }

      // Fallback to local storage
      if (!imageUrl) {
        const uploadPath = config.upload.uploadPath;
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const localFileName = fileName;
        const localPath = path.join(uploadPath, localFileName);
        fs.writeFileSync(localPath, file.buffer);

        imageUrl = `${config.upload.imageBucketUrl}/${localFileName}`;
        imageId = localFileName;
        console.log(`[${file.fieldname}] Using local storage: ${imageUrl}`);
      }

      // Attach image info to request
      req.file.cloudflareUrl = imageUrl;
      req.file.cloudflareId = imageId;
      req.file.url = imageUrl; // For backward compatibility
      req.file.filename = fileName; // Ensure filename is set
    }

    next();
  } catch (error) {
    console.error("Error in Cloudflare upload middleware:", error);
    next(error);
  }
};

// Export multer instances
export const Upload = multerInstance;
export const UploadThumbnail = multerInstance.single("thumbnail");
export const UploadMultiple = multerInstance.array("images", 10);
export const UploadProduct = multerInstance.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);
