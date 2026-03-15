export const isTrackerEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.FEATURE_TRACKER === 'true';
  }
  return process.env.NEXT_PUBLIC_FEATURE_TRACKER === 'true';
};

export const isImportEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.FEATURE_IMPORT === 'true';
  }

  return process.env.NEXT_PUBLIC_FEATURE_IMPORT === 'true';
};

export const isDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return process.env.DEBUG_PROXY === 'true';
  }
  return process.env.NEXT_PUBLIC_DEBUG_PROXY === 'true';
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';