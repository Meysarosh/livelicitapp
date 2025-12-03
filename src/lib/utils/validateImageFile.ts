import { ALLOWED_IMAGE_TYPES, IMAGE_MAGIC_BYTES } from '@/lib/constants';

/**
 * Validates that a file is a valid image by checking:
 * 1. MIME type
 * 2. Magic bytes (file signature)
 */
export async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Validate MIME type
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
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
 * Validates file content by checking magic bytes (file signature)
 */
function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 4) {
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
      // WebP has RIFF at start and WEBP at offset 8
      if (!matchesSignature(bytes, IMAGE_MAGIC_BYTES.webp)) {
        return false;
      }
      // Check for WEBP signature at offset 8
      if (bytes.length < 12) {
        return false;
      }
      return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
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
