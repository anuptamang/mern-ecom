# Setup Cloudflare R2 and Images - Image Handling Workflow

Complete setup workflow for Cloudflare R2 storage and Cloudflare Images optimization.

## Purpose
Configure Cloudflare R2 for object storage and Cloudflare Images for automatic image optimization and transformations.

## Prerequisites
- Cloudflare account (free tier available)
- Node.js 18+ (for native fetch support)
- Required packages: `@aws-sdk/client-s3` and `form-data`

## Steps

### 1. Create Cloudflare R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **Create bucket**
3. Enter bucket name (e.g., `ecommerce-images`)
4. Choose location (closest to your users)
5. Click **Create bucket**

### 2. Create R2 API Token

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read & Write** (for uploads)
   - **Bucket Read & Write** (for bucket operations)
4. Copy the **Access Key ID** and **Secret Access Key**

### 3. Get Account ID

1. In Cloudflare Dashboard, select your account
2. Copy your **Account ID** from the right sidebar

### 4. Configure Public Access

**Option A: Use R2.dev URL (Free)**
1. Go to **R2** → Your bucket → **Settings** → **Public Access**
2. Enable **Public Access** for the bucket
3. URLs will be: `https://pub-{accountId}.r2.dev/uploads/{filename}`

**Option B: Custom Domain (Recommended for Production)**
1. Enable **Public Access** for the bucket
2. Add a custom domain (e.g., `cdn.yourdomain.com`)
3. Follow DNS configuration instructions

### 5. Setup Cloudflare Images (Optional but Recommended)

1. Go to **Images** in Cloudflare Dashboard
2. Click **Get Started** (if not already enabled)
3. Note your **Account Hash** (found in Images settings)

### 6. Create Images API Token

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use **Edit Cloudflare Images** template OR create custom token:
   - **Permissions**: **Account** → **Cloudflare Images** → **Edit**
   - **Account Resources**: Include your account
4. Copy the API token (you'll only see it once!)

### 7. Configure Environment Variables

Add to `server/.env`:

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

### 8. Install Required Packages

```bash
cd server
npm install @aws-sdk/client-s3 form-data
```

### 9. Restart Server

```bash
# Stop server
npm run dev:stop

# Start server
npm run dev
```

### 10. Verify Setup

1. Upload an image through your application
2. Check R2 bucket to see if the file was uploaded
3. Verify the image URL is accessible
4. If using Cloudflare Images, check if URL contains `imagedelivery.net`

## Important Notes

- **R2 Endpoint Format**: Must be `https://{accountId}.r2.cloudflarestorage.com` (NOT including bucket name)
- **Public Access**: R2 buckets are private by default - enable public access in Dashboard
- **No ACLs**: R2 doesn't support S3-style ACLs - public access is configured at bucket level
- **Fallback**: System automatically falls back: Cloudflare Images → R2 → Local Storage

## Troubleshooting

### SignatureDoesNotMatch Error
- Verify endpoint format (no bucket name)
- Check credentials are correct
- Ensure no extra spaces in `.env` file

### Images Not Uploading
- Verify R2 credentials are correct
- Check bucket name matches exactly
- Ensure public access is enabled

### Images Not Optimizing
- Verify Cloudflare Images API token is correct
- Check account hash is set correctly
- Ensure Images is enabled in your account

## Documentation
See `docs/enterprise/CLOUDFLARE_SETUP.md` for detailed troubleshooting.
