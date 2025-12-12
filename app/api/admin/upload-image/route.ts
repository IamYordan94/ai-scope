import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthorized, getUnauthorizedResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return getUnauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageUrl = formData.get('imageUrl') as string | null;

    // If imageUrl is provided, download and upload it
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          return NextResponse.json(
            { success: false, error: 'Failed to download image from URL' },
            { status: 400 }
          );
        }

        const blob = await response.blob();
        const contentType = blob.type || 'image/jpeg';
        
        // Validate content type
        if (!ALLOWED_TYPES.includes(contentType)) {
          return NextResponse.json(
            { success: false, error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' },
            { status: 400 }
          );
        }

        // Validate file size
        if (blob.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: 'Image too large. Maximum size: 5MB' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = contentType.split('/')[1] || 'jpg';
        const filename = `blog-hero-${timestamp}.${extension}`;

        // Upload to Supabase Storage
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(filename, blob, {
            contentType,
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error:', error);
          return NextResponse.json(
            { success: false, error: `Upload failed: ${error.message}` },
            { status: 500 }
          );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filename);

        return NextResponse.json({
          success: true,
          url: urlData.publicUrl,
          filename,
        });
      } catch (error: any) {
        console.error('Error downloading/uploading image:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Failed to process image URL' },
          { status: 500 }
        );
      }
    }

    // If file is provided, upload it directly
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file or image URL provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `blog-hero-${timestamp}.${extension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

