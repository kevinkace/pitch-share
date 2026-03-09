/**
 * Feature flags utility for controlling application features
 */

/**
 * Check if pitch placement functionality is enabled
 * This feature is controlled by environment variables and defaults to disabled
 */
export const isTrackerEnabled = (): boolean => {
  // Server-side check
  if (typeof window === 'undefined') {
    return process.env.FEATURE_TRACKER === 'true';
  }

  // Client-side check
  return process.env.NEXT_PUBLIC_FEATURE_TRACKER === 'true';
};

/**
 * Check if import functionality is enabled
 * This feature is controlled by environment variables and defaults to disabled
 */
export const isImportEnabled = (): boolean => {
  // Server-side check
  if (typeof window === 'undefined') {
    return process.env.FEATURE_IMPORT === 'true';
  }

  // Client-side check
  return process.env.NEXT_PUBLIC_FEATURE_IMPORT === 'true';
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';