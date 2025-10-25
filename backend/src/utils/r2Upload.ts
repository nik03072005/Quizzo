import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imageId?: string;
  error?: string;
}

// Configure R2 client
const createR2Client = () => {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Upload image to Cloudflare R2
 * @param imageBuffer - Image buffer from file upload
 * @param filename - Original filename
 * @param metadata - Optional metadata for the image
 * @returns Promise with upload result
 */
export const uploadToR2 = async (
  imageBuffer: Buffer,
  filename: string,
  metadata?: Record<string, string>
): Promise<UploadResult> => {
  try {
    const client = createR2Client();
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!bucketName || !publicUrl) {
      throw new Error('R2 bucket configuration missing');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `school-ids/${timestamp}-${randomString}.${extension}`;

    // Prepare upload command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: imageBuffer,
      ContentType: getContentType(filename),
      Metadata: {
        originalName: filename,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });

    // Upload to R2
    await client.send(command);

    // Construct public URL
    const imageUrl = `${publicUrl}/${uniqueFilename}`;

    console.log(`✅ Image uploaded to R2: ${uniqueFilename}`);

    return {
      success: true,
      imageUrl,
      imageId: uniqueFilename,
    };
  } catch (error) {
    console.error('❌ R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
};

/**
 * Delete image from Cloudflare R2
 * @param imageId - R2 object key (filename)
 * @returns Promise with deletion result
 */
export const deleteFromR2 = async (imageId: string): Promise<boolean> => {
  try {
    const client = createR2Client();
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('R2 bucket configuration missing');
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: imageId,
    });

    await client.send(command);

    console.log(`✅ Image deleted from R2: ${imageId}`);
    return true;
  } catch (error) {
    console.error('❌ R2 deletion error:', error);
    return false;
  }
};

/**
 * Get content type based on file extension
 * @param filename - File name with extension
 * @returns Content type string
 */
const getContentType = (filename: string): string => {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg'; // Default fallback
  }
};

/**
 * Validate image file
 * @param buffer - Image buffer
 * @param filename - Original filename
 * @returns Validation result
 */
export const validateImage = (buffer: Buffer, filename: string): { valid: boolean; error?: string } => {
  // Check file size (max 10MB for R2)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (buffer.length > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const extension = filename.toLowerCase().split('.').pop();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Only JPG, PNG, WebP, and GIF images are allowed' };
  }

  // Check if it's actually an image by checking magic bytes
  const isValidImage = checkImageMagicBytes(buffer);
  if (!isValidImage) {
    return { valid: false, error: 'Invalid image file format' };
  }

  return { valid: true };
};

/**
 * Check image magic bytes to verify it's a real image
 * @param buffer - Image buffer
 * @returns True if valid image
 */
const checkImageMagicBytes = (buffer: Buffer): boolean => {
  if (buffer.length < 4) return false;

  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // WebP
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return true;
  }

  // GIF
  if (buffer.toString('ascii', 0, 3) === 'GIF') {
    return true;
  }

  return false;
};