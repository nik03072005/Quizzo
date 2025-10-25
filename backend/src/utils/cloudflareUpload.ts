import FormData from 'form-data';

interface CloudflareImageResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imageId?: string;
  error?: string;
}

/**
 * Upload image to Cloudflare Images
 * @param imageBuffer - Image buffer from file upload
 * @param filename - Original filename
 * @param metadata - Optional metadata for the image
 * @returns Promise with upload result
 */
export const uploadToCloudflare = async (
  imageBuffer: Buffer,
  filename: string,
  metadata?: Record<string, string>
): Promise<UploadResult> => {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', imageBuffer, filename);

    // Add metadata if provided
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // Upload to Cloudflare Images
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: formData,
      }
    );

    const result = await response.json() as CloudflareImageResponse;

    if (!result.success) {
      console.error('Cloudflare upload error:', result.errors);
      return {
        success: false,
        error: result.errors?.[0]?.message || 'Upload failed',
      };
    }

    // Get the public URL for the image
    const imageUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGES_HASH}/${result.result.id}/public`;

    console.log(`✅ Image uploaded to Cloudflare: ${result.result.id}`);

    return {
      success: true,
      imageUrl,
      imageId: result.result.id,
    };
  } catch (error) {
    console.error('❌ Cloudflare upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
};

/**
 * Delete image from Cloudflare Images
 * @param imageId - Cloudflare image ID
 * @returns Promise with deletion result
 */
export const deleteFromCloudflare = async (imageId: string): Promise<boolean> => {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare credentials not configured');
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    const result = await response.json() as CloudflareImageResponse;

    if (result.success) {
      console.log(`✅ Image deleted from Cloudflare: ${imageId}`);
      return true;
    } else {
      console.error('Cloudflare deletion error:', result.errors);
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudflare deletion error:', error);
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
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (buffer.length > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const extension = filename.toLowerCase().split('.').pop();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
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