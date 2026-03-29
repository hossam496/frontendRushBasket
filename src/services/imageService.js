
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
  if (!rawImage || typeof rawImage !== 'string') return null;

  // 1. If it's already a full URL or base64, return as is
  if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
    return rawImage;
  }

  // 2. Prepend the API_BASE_URL (removing any trailing /api suffix for assets)
  // API_BASE_URL is usually http://localhost:5000 or a domain
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  
  // 3. Ensure the path starts with /uploads/ (or just / if it's already there)
  if (rawImage.startsWith('/')) {
    return `${baseUrl}${rawImage}`;
  }
  
  // 4. Fallback: assume it's in the uploads folder
  return `${baseUrl}/uploads/${rawImage}`;
};
