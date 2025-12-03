import { ALLOWED_IMAGE_TYPES, IMAGE_MAGIC_BYTES } from '@/lib/constants';

/**
 * Validates that a file is a valid image by checking:
 * 1. MIME type
 * 2. Magic bytes (file signature)
 */
type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

function isAllowedImageType(type: string): type is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.some((allowedType) => allowedType === type);
}

export async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Validate MIME type
  if (!isAllowedImageType(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, GIF, WebP.`,
    };
  }

  // Validate magic bytes
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const isValidImage = validateMagicBytes(bytes, file.type);

    if (!isValidImage) {
      return {
        valid: false,
        error: 'File content does not match the declared file type.',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Failed to validate file content.',
    };
  }
}

/**
 * Get minimum byte length required for validating a specific image format
 */
function getMinByteLength(mimeType: string): number {
  switch (mimeType) {
    case 'image/jpeg':
      return 3;
    case 'image/webp':
      return 12;
    case 'image/png':
    case 'image/gif':
    default:
      return 4;
  }
}

/**
 * Validates file content by checking magic bytes (file signature)
 */
function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  // Check minimum length based on format requirements
  if (bytes.length < getMinByteLength(mimeType)) {
    return false;
  }

  switch (mimeType) {
    case 'image/jpeg':
      return matchesSignature(bytes, IMAGE_MAGIC_BYTES.jpeg);
    case 'image/png':
      return matchesSignature(bytes, IMAGE_MAGIC_BYTES.png);
    case 'image/gif':
      return matchesSignature(bytes, IMAGE_MAGIC_BYTES.gif);
    case 'image/webp':
      // WebP has RIFF at start and WEBP identifier at offset 8
      return (
        matchesSignature(bytes, IMAGE_MAGIC_BYTES.webp) &&
        matchesSignature(bytes.slice(8), IMAGE_MAGIC_BYTES.webpIdentifier)
      );
    default:
      return false;
  }
}

/**
 * Check if bytes match the expected signature
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => bytes[index] === byte);
}
