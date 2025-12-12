# Supabase Storage Setup for Blog Images

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ **Enable this** (so images can be accessed via public URLs)
   - **File size limit**: 5 MB (or your preference)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`
5. Click **"Create bucket"**

## Step 2: Set Up Storage Policies (Optional but Recommended)

If you want to restrict uploads to admin only:

1. Go to **Storage** > **Policies** > `blog-images`
2. Click **"New policy"**
3. Create a policy for uploads:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'blog-images')
     ```
   - **Policy check**: Leave empty (or add your custom check)

**Note**: Since we're using the service role key in the API, uploads will work even without policies. Policies are mainly for client-side uploads.

## Step 3: Test the Upload

1. Go to `/admin/blog/create-posts?secret=your-key`
2. Select a tool and create a blog post
3. Try uploading an image:
   - **Option A**: Click "Upload from Computer" and select an image file
   - **Option B**: Paste an image URL (e.g., from krea.ai) and click "Download & Upload"

The image will be:
- Downloaded from the URL (if using Option B)
- Uploaded to Supabase Storage
- Stored permanently in the `blog-images` bucket
- A permanent public URL will be generated and auto-filled in the "Hero Image URL" field

## Benefits

✅ **Permanent hosting** - Images won't disappear if external sites delete them  
✅ **Fast CDN** - Supabase uses a global CDN for fast image delivery  
✅ **Free tier** - 1 GB storage included in Supabase free tier  
✅ **Automatic optimization** - Images are served efficiently  

## Storage Limits

- **Free tier**: 1 GB storage
- **Pro tier**: 100 GB storage
- Each image is typically 100-500 KB, so you can store ~2,000-10,000 images on the free tier

## Troubleshooting

**Error: "Bucket not found"**
- Make sure you created the bucket with the exact name `blog-images`
- Check that the bucket is public

**Error: "Upload failed"**
- Check that your `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the bucket exists and is public
- Check file size (max 5 MB)

**Images not showing**
- Verify the bucket is set to **public**
- Check that the public URL is correct
- Try accessing the URL directly in your browser

