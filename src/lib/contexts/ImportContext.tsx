'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';

interface ImportContextType {
  isUploading: boolean;
  uploadProgress: number;
  processAndImportFile: (file: File, isPrivate?: boolean) => Promise<void>;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export function ImportProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processAndImportFile = async (file: File, isPrivate: boolean = true) => {
    if (!user) {
      alert('You must be logged in to import sessions');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();

      // Generate unique file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${user.id}/${timestamp}-${file.name}`;

      setUploadProgress(25);

      // Upload CSV to storage
      const { error: uploadError } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(50);

      // Call Edge Function to process CSV
      // First, try to refresh the session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.access_token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Check if token is close to expiring and refresh if needed
      const tokenExp = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenExp ? tokenExp - now : 0;

      let activeSession = session;

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 300) {
        console.log('Token expiring soon, refreshing session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshData.session) {
          throw new Error('Session expired. Please log in again.');
        }

        activeSession = refreshData.session;
      }

      console.log('Using token, expires at:', new Date(activeSession.expires_at! * 1000).toISOString());

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-csv`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeSession.access_token}`,
        },
        body: JSON.stringify({
          filePath,
          isPrivate
        })
      });

      // Read the response body once as text
      const responseText = await response.text();

      if (!response.ok) {
        console.error('API Error Response:', responseText);

        // Try to parse the error as JSON for better error messages
        try {
          const errorObj = JSON.parse(responseText);
          if (errorObj.error && errorObj.details) {
            throw new Error(`${errorObj.error}: ${errorObj.details}`);
          } else if (errorObj.error) {
            throw new Error(errorObj.error);
          }
        } catch (parseError) {
          // If not JSON or parsing failed, use the raw text
          throw new Error(`Processing failed: ${responseText}`);
        }
      }

      setUploadProgress(90);

      // Parse the successful response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      setUploadProgress(100);

      // Success! Redirect to user's profile session page
      setTimeout(() => {
        router.push(`/profile/sessions/${result.sessionId}`);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (err) {
      console.error('Error importing CSV:', err);

      alert(`Import failed: ${err.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ImportContext.Provider value={{
      isUploading,
      uploadProgress,
      processAndImportFile
    }}>
      {children}
    </ImportContext.Provider>
  );
}

export function useImport() {
  const context = useContext(ImportContext);
  if (context === undefined) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
}
