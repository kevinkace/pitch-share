/**
 * Feature flags utility for controlling application features
 */

/**
 * Check if pitch placement functionality is enabled
 * This feature is controlled by environment variables and defaults to disabled
 */
export const isPitchPlacementEnabled = (): boolean => {
  // Server-side check
  if (typeof window === 'undefined') {
    return process.env.ENABLE_PLACEMENT_CREATE === 'true';
  }

  // Client-side check
  return process.env.NEXT_PUBLIC_ENABLE_PLACEMENT_CREATE === 'true';
};

export const isPitchDeleteEnabled = (): boolean => {
  // Server-side check
  if (typeof window === 'undefined') {
    return process.env.ENABLE_PLACEMENT_DELETE === 'true';
  }

  // Client-side check
  return process.env.NEXT_PUBLIC_ENABLE_PLACEMENT_DELETE === 'true';
};

/**
 * Environment information
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';