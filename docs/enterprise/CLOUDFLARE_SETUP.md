# Cloudflare Image Handling Setup Guide

This guide walks you through setting up Cloudflare R2 storage and Cloudflare Images for enterprise-grade image handling.

## Overview

The application now supports:

- **Cloudflare R2**: S3-compatible object storage with no egress fees
- **Cloudflare Images**: Automatic image optimization, transformations, and modern format support (WebP/AVIF)
- **Global CDN**: Built-in CDN for fast image delivery worldwide
- **Responsive Images**: Automatic srcset generation for different screen sizes
- **Modern Formats**: WebP and AVIF support with automatic fallbacks

## Prerequisites

1. Cloudflare account (free tier available)
2. Node.js 18+ (for native fetch support)
3. Required packages installed: `@aws-sdk/client-s3` and `form-data`

## Step 1: Set Up Cloudflare R2 Storage

### 1.1 Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Create bucket**
3. Enter a bucket name (e.g., `ecommerce-images`)
4. Choose a location (closest to your users)
5. Click **Create bucket**

### 1.2 Create R2 API Token

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read & Write** (for uploads)
   - **Bucket Read & Write** (for bucket operations)
4. Copy the **Access Key ID** and **Secret Access Key**

### 1.3 Get Account ID

1. In Cloudflare Dashboard, select your account
2. Copy your **Account ID** from the right sidebar

### 1.4 Configure Public Access (Required for Image URLs)

**Important**: R2 buckets are private by default. You must enable public access to serve images.

**Option A: Use R2.dev URL (Free)**

1. Go to **R2** → Your bucket → **Settings** → **Public Access**
2. Enable **Public Access** for the bucket
3. Note: URLs will be: `https://pub-{accountId}.r2.dev/uploads/{filename}`
4. No additional DNS setup needed

**Option B: Custom Domain (Recommended for Production)**

1. Go to **R2** → Your bucket → **Settings** → **Public Access**
2. Enable **Public Access** for the bucket
3. Add a custom domain (e.g., `cdn.yourdomain.com`)
4. Follow DNS configuration instructions
5. Use this domain in `CLOUDFLARE_R2_PUBLIC_URL`

**Note**: R2 doesn't support per-object ACLs like S3. Public access is configured at the bucket level in the Cloudflare Dashboard.

## Step 2: Set Up Cloudflare Images (Optional but Recommended)

Cloudflare Images provides automatic optimization and transformations.

### 2.1 Enable Cloudflare Images

1. Go to **Images** in Cloudflare Dashboard
2. Click **Get Started** (if not already enabled)
3. Note your **Account Hash** (found in Images settings)

### 2.2 Create API Token

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Edit Cloudflare Images** template OR create a custom token:
   - **Permissions**:
     - **Account** → **Cloudflare Images** → **Edit**
   - **Account Resources**:
     - Include: **All accounts** or select your specific account
4. Copy the API token (you'll only see it once!)
5. **Important**: Make sure the token has access to the correct account ID

### 2.3 Configure Variants (Optional)

Variants are pre-configured image sizes. Default variants are usually sufficient, but you can create custom ones:

1. Go to **Images** → **Variants**
2. Create variants like:
   - `thumbnail` (400x400, cover)
   - `medium` (800x800, cover)
   - `large` (1200x1200, cover)

## Step 3: Configure Environment Variables

Add these variables to your `server/.env` file:

```env
# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=ecommerce-images
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://cdn.yourdomain.com  # Optional: custom domain, or leave empty for R2.dev

# Cloudflare Images (Optional)
CLOUDFLARE_IMAGES_API_TOKEN=your_images_api_token
CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash
```

### Environment Variable Details

| Variable                          | Required | Description                                 |
| --------------------------------- | -------- | ------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`           | Yes      | Your Cloudflare account ID                  |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`     | Yes      | R2 API access key ID                        |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Yes      | R2 API secret access key                    |
| `CLOUDFLARE_R2_BUCKET_NAME`       | Yes      | Your R2 bucket name                         |
| `CLOUDFLARE_R2_ENDPOINT`          | No       | R2 endpoint (auto-generated if not set)     |
| `CLOUDFLARE_R2_PUBLIC_URL`        | No       | Custom domain for public access (or R2.dev) |
| `CLOUDFLARE_IMAGES_API_TOKEN`     | No       | Images API token (for optimization)         |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH`  | No       | Images account hash (for optimization)      |

## Step 4: Install Required Packages

```bash
cd server
npm install @aws-sdk/client-s3 form-data
```

## Step 5: Verify Setup

### 5.1 Test R2 Upload

1. Start your server
2. Upload an image through your application
3. Check R2 bucket to see if the file was uploaded
4. Verify the image URL is accessible

### 5.2 Test Cloudflare Images (if configured)

1. Upload an image
2. Check if the image URL contains `imagedelivery.net`
3. Try accessing the image with different variants:
   - `https://imagedelivery.net/{accountHash}/{imageId}/public`
   - `https://imagedelivery.net/{accountHash}/{imageId}/w400-h400-cover-webp`

## How It Works

### Upload Flow

1. **Client uploads image** → Multer processes file in memory
2. **Cloudflare middleware** → Uploads to Cloudflare Images (if configured)
3. **Fallback to R2** → If Images fails or not configured, uploads to R2
4. **Fallback to local** → If R2 fails, saves to local storage
5. **Controller** → Uses `req.file.url` or `req.file.cloudflareUrl`

### Image URL Generation

The application automatically generates optimized URLs:

- **Cloudflare Images**: `https://imagedelivery.net/{hash}/{id}/{variant}`
- **R2**: `https://cdn.yourdomain.com/uploads/{filename}` or `https://pub-{accountId}.r2.dev/uploads/{filename}`
- **Local**: `http://localhost:3010/uploads/{filename}`

### Frontend Image Optimization

The `ProductImage` component automatically:

- Generates responsive `srcset` for different screen sizes
- Provides WebP and AVIF formats for modern browsers
- Falls back to JPEG/PNG for older browsers
- Uses lazy loading for performance

## Migration from Local Storage

### Option 1: Gradual Migration (Recommended)

1. Keep both local and Cloudflare storage enabled
2. New uploads go to Cloudflare
3. Existing images remain on local storage
4. Gradually migrate old images to Cloudflare

### Option 2: Full Migration

1. Upload all existing images to R2
2. Update database URLs
3. Remove local storage

## Troubleshooting

### R2 Upload Errors

**Error: "SignatureDoesNotMatch" or "The request signature we calculated does not match"**

- Verify `CLOUDFLARE_R2_ACCESS_KEY_ID` and `CLOUDFLARE_R2_SECRET_ACCESS_KEY` are correct
- Check that the credentials match the R2 API token you created
- Ensure there are no extra spaces or quotes in your `.env` file
- Verify the bucket name in `CLOUDFLARE_R2_BUCKET_NAME` matches exactly
- Check that the endpoint is correct:
  - **Correct format**: `https://{accountId}.r2.cloudflarestorage.com`
  - **Do NOT include bucket name** in the endpoint (e.g., `https://bucket-name.accountId.r2.cloudflarestorage.com` is wrong)
  - If using `CLOUDFLARE_R2_ENDPOINT`, ensure it's just the endpoint URL without the bucket name
- Verify `CLOUDFLARE_ACCOUNT_ID` is correct (used for endpoint generation if `CLOUDFLARE_R2_ENDPOINT` is not set)

**Error: "NoSuchBucket" or "Bucket not found"**

- Verify `CLOUDFLARE_R2_BUCKET_NAME` matches your bucket name exactly
- Check that the bucket exists in your Cloudflare account
- Ensure the bucket is in the correct account (if you have multiple accounts)

**Error: "Access denied" or 403 Forbidden**

- Verify your R2 API token has **Object Read & Write** permissions
- Check that the bucket allows public access (if using public URLs)
- Ensure the API token is for the correct account

**Images upload but URLs return 404**

- Verify public access is enabled for your R2 bucket (Settings → Public Access)
- Check that `CLOUDFLARE_R2_PUBLIC_URL` is set correctly (or use R2.dev URL)
- Ensure the bucket's public access domain is configured correctly

### Images Not Optimizing / Authentication Errors

**Error: "Unable to authenticate request"**

- Verify `CLOUDFLARE_IMAGES_API_TOKEN` is correct
- Check `CLOUDFLARE_ACCOUNT_ID` matches the account the token was created for
- Ensure the API token has **Cloudflare Images** → **Edit** permissions
- Verify the token is for the correct account (not a different account)
- Check if the token has expired (tokens don't expire by default, but check if it was deleted)

**Error: "CLOUDFLARE_IMAGES_API_TOKEN is not configured"**

- Add `CLOUDFLARE_IMAGES_API_TOKEN` to your `.env` file
- Restart your server after adding the token

**Error: "CLOUDFLARE_ACCOUNT_ID is not configured"**

- Add `CLOUDFLARE_ACCOUNT_ID` to your `.env` file
- Make sure it matches the account where Images is enabled

**Images upload but URLs don't work**

- Verify `CLOUDFLARE_IMAGES_ACCOUNT_HASH` is set correctly
- Check the account hash in Cloudflare Images settings
- Ensure Images is enabled in your account

### CORS Issues

- Configure CORS in R2 bucket settings
- Add your domain to allowed origins
- Check browser console for CORS errors

### Image URLs Not Working

- Verify `CLOUDFLARE_R2_PUBLIC_URL` is correct
- Check custom domain DNS configuration
- Ensure bucket is set to public access
- Test R2.dev URL as fallback

## Cost Considerations

### Cloudflare R2

- **Storage**: $0.015/GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: **FREE** (no egress fees!)

### Cloudflare Images

- **Free Tier**: 100,000 images/month
- **Paid**: $1 per 100,000 images after free tier
- **Storage**: Included in R2 pricing
- **Transformations**: Included

### Comparison to AWS S3

- **R2**: No egress fees (huge savings!)
- **S3**: ~$0.09/GB egress
- **R2**: Slightly higher storage cost
- **R2**: Better for high-traffic applications

## Best Practices

1. **Use Cloudflare Images** for automatic optimization
2. **Set up custom domain** for production
3. **Enable CDN caching** for better performance
4. **Use responsive images** with srcset
5. **Monitor usage** in Cloudflare dashboard
6. **Set up alerts** for quota limits
7. **Use variants** for common image sizes
8. **Enable compression** in Cloudflare dashboard

## Next Steps

1. ✅ Set up Cloudflare R2
2. ✅ Configure environment variables
3. ✅ Test image uploads
4. ✅ Set up Cloudflare Images (optional)
5. ✅ Configure custom domain (production)
6. ✅ Migrate existing images
7. ✅ Monitor usage and costs

## Support

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [Cloudflare Community](https://community.cloudflare.com/)
