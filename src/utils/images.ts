import type { User } from '../types';

/**
 * Image URL utilities for handling broken CDN links.
 *
 * The FreeAPI's randomproducts use cdn.dummyjson.com/product-images/ which returns 404.
 * We provide reliable fallback images based on product category/id.
 */

// Category-to-image mapping using Unsplash for reliable, beautiful thumbnails
const CATEGORY_IMAGES: Record<string, string[]> = {
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop',
  ],
  laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
  ],
  fragrances: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1594035910387-fea081d301c7?w=400&h=300&fit=crop',
  ],
  skincare: [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=400&h=300&fit=crop',
  ],
  groceries: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400&h=300&fit=crop',
  ],
  'home-decoration': [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  ],
};

// Fallback: beautiful abstract course-like images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
];

/**
 * Returns a reliable image URL for a course/product.
 * Falls back to Unsplash images when CDN URLs are broken.
 */
export function getCourseImageUrl(
  id: number,
  category?: string,
  originalUrl?: string,
): string {
  // If the URL is from the broken CDN, use our fallback
  if (!originalUrl || originalUrl.includes('cdn.dummyjson.com')) {
    // Try category-specific images first
    if (category) {
      const catImages = CATEGORY_IMAGES[category.toLowerCase()];
      if (catImages) {
        return catImages[(id - 1) % catImages.length];
      }
    }
    // Use fallback images based on product ID
    return FALLBACK_IMAGES[(id - 1) % FALLBACK_IMAGES.length];
  }

  return originalUrl;
}

/**
 * Returns a reliable thumbnail URL.
 */
export function getCourseThumbnailUrl(
  id: number,
  category?: string,
  originalThumbnail?: string,
): string {
  return getCourseImageUrl(id, category, originalThumbnail);
}

/**
 * Returns a reliable user avatar URL.
 * Overrides generic placeholder URLs with a custom ui-avatars.com fallback.
 */
export function getUserAvatarUrl(user?: User | null): string {
  // Mobile devices often misalign SVGs from ui-avatars, so we enforce format=png
  const defaultFallback = `https://ui-avatars.com/api/?name=${user?.username || 'U'}&size=120&background=E2DFFF&color=3730A3&bold=true&format=png`;
  
  if (!user?.avatar?.url) return defaultFallback;
  
  let url = user.avatar.url;
  // FreeAPI sometimes returns string placeholder links or dummy URLs for new users
  if (
    url.includes('via.placeholder.com') || 
    url.includes('default') || 
    url.includes('dummyjson') || 
    url.trim() === ''
  ) {
    return defaultFallback;
  }

  // FreeAPI backend occasionally leaks local loopbacks from their docker image
  url = url.replace(/http:\/\/(localhost|10\.0\.2\.2|127\.0\.0\.1)(:\d+)?/g, 'https://api.freeapi.app');

  // Ensure returned URLs are absolute and explicitly use HTTPS for mobile
  // Handle relative paths (with or without leading slash)
  if (!url.startsWith('http') && !url.startsWith('file') && !url.startsWith('data')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    url = `https://api.freeapi.app${cleanPath}`;
  }
  
  // Force HTTPS for any http:// links to bypass Android Cleartext policy
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  return url;
}
