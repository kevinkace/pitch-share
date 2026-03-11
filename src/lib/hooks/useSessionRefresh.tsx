'use client'

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook to handle session refresh when tab becomes visible
 * Helps prevent authentication redirects when user tabs away and back
 */
export function useSessionRefresh() {
  useEffect(() => {
    const supabase = createClient();
    let isRefreshing = false; // Prevent multiple simultaneous refreshes

    const handleVisibilityChange = async () => {
      // Only act when tab becomes visible (not when it becomes hidden)
      if (!document.hidden && !isRefreshing) {
        isRefreshing = true;

        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Failed to get session:', error);
            return;
          }

          // If we have a session, check if it needs refreshing
          if (session && session.expires_at) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = session.expires_at - now;

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 300) {
              console.log('Session expiring soon, refreshing...');
              const { error: refreshError } = await supabase.auth.refreshSession();

              if (refreshError) {
                console.error('Failed to refresh session:', refreshError);
              } else {
                console.log('Session refreshed successfully');
              }
            }
          }
        } catch (error) {
          console.error('Error handling session refresh on visibility change:', error);
        } finally {
          isRefreshing = false;
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}