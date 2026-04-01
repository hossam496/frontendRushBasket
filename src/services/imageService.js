import API_URL from "./api";

/**
 * Resolves a product image URL correctly regardless of its format.
 * Handles:
 * 1. Absolute URLs (http://... or https://...)
 * 2. Base64 data URLs (data:image/...)
 * 3. Relative paths with leading slash (/uploads/products/...)
 * 4. Relative paths without leading slash (product.jpg)
 */
export const resolveImageSrc = (rawImage) => {
  if (!rawImage || typeof rawImage !== 'string') {
    return 'https://placehold.co/300x300?text=No+Image';
  }

  // 1. If it's already a full URL or base64, return as is
  if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
    return rawImage;
  }

  // 2. Normalize Base URL (remove trailing slash and /api suffix)
  const baseUrl = API_URL.defaults.baseURL || '';
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
  
  // 3. Handle paths with leading slash
  if (rawImage.startsWith('/')) {
    return `${normalizedBaseUrl}${rawImage}`;
  }
  
  // 4. Fallback: assume it's in the uploads folder
  return `${normalizedBaseUrl}/uploads/${rawImage}`;
};
