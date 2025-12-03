export const DEFAULT_CURRENCY = 'HUF';

export const SUPPORTED_CURRENCIES = ['HUF', 'EUR', 'USD'];

export const TIME_EXTEND_AFTER_BID = 5 * 60 * 1000; // 5 minutes in milliseconds

export const MAX_IMAGES = 8;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

// Magic bytes for image file validation
export const IMAGE_MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF header, followed by WEBP at offset 8
} as const;
