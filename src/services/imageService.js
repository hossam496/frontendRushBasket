
import { API_BASE_URL } from "./api";

/**
 * Resolves a product image URL correctly regardless of its format.
 * Handles:
 * 1. Absolute URLs (http://... or https://...)
 * 2. Base64 data URLs (data:image/...)
 * 3. Relative paths with leading slash (/uploads/...)
 * 4. Relative paths without leading slash (product.jpg)
 * 5. Legacy paths (/images/...)
 * 
 * @param {string} rawImage - The image string from the database
 * @returns {string|null} - The full resolved URL or null if rawImage is invalid
 */
export const resolveImageSrc = (rawImage) => {
  if (!rawImage || typeof rawImage !== 'string') {
    console.debug('[ImageService] Invalid image input:', rawImage);
    return null;
  }

  // 1. If it's already a full URL or base64, return as is
  if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
    return rawImage;
  }

  // 2. Prepend the API_BASE_URL (ensure we have the correct base)
  // Remove /api if present, but keep the rest
  let baseUrl = API_BASE_URL;
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4); // Remove '/api'
  } else if (baseUrl.includes('/api/')) {
    baseUrl = baseUrl.replace('/api/', '/');
  }
  
  // Remove trailing slash to avoid double slashes
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // 3. Handle different path formats
  if (rawImage.startsWith('/')) {
    const result = `${baseUrl}${rawImage}`;
    console.debug('[ImageService] Resolving image (with leading slash):', { rawImage, baseUrl, result });
    return result;
  }
  
  // 4. Fallback: assume it's in the uploads folder
  const result = `${baseUrl}/uploads/${rawImage}`;
  console.debug('[ImageService] Resolving image (fallback to uploads):', { rawImage, baseUrl, result });
  return result;
};
