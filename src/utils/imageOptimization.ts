import Resizer from 'react-image-file-resizer';

/**
 * Image optimization utilities
 * Provides compression, resizing, and format conversion for avatar images
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  outputType?: 'base64' | 'blob' | 'file';
}

/**
 * Optimizes an image file for avatar use
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise<string | Blob | File> - Optimized image
 */
export const optimizeImage = (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<string | Blob | File> => {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 80,
    format = 'JPEG',
    outputType = 'base64'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        format,
        quality,
        0, // rotation
        (result) => {
          resolve(result as string | Blob | File);
        },
        outputType,
        maxWidth, // minWidth
        maxHeight // minHeight
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Validates if a file is a valid image
 * @param file - File to validate
 * @returns boolean - True if valid image
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Converts a data URL to a blob
 * @param dataUrl - Data URL string
 * @returns Blob - Converted blob
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Gets the size of an image file in bytes
 * @param file - File to check
 * @returns number - Size in bytes
 */
export const getImageSize = (file: File): number => {
  return file.size;
};

/**
 * Formats file size for display
 * @param bytes - Size in bytes
 * @returns string - Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates a cache key for an image URL
 * @param url - Image URL
 * @returns string - Cache key
 */
export const generateImageCacheKey = (url: string): string => {
  return `img_cache_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
};

/**
 * Caches an image in localStorage (for small images)
 * @param url - Image URL
 * @param dataUrl - Base64 data URL
 */
export const cacheImage = (url: string, dataUrl: string): void => {
  try {
    const key = generateImageCacheKey(url);
    localStorage.setItem(key, dataUrl);
  } catch (error) {
    console.warn('Failed to cache image:', error);
  }
};

/**
 * Retrieves a cached image from localStorage
 * @param url - Image URL
 * @returns string | null - Cached data URL or null
 */
export const getCachedImage = (url: string): string | null => {
  try {
    const key = generateImageCacheKey(url);
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to retrieve cached image:', error);
    return null;
  }
};
