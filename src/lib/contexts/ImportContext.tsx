'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { DuplicateSessionDialog } from '@/components/SESSION/DuplicateSessionDialog/DuplicateSessionDialog';

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
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
    const [duplicateSessionData, setDuplicateSessionData] = useState<{
        filename: string;
        session: any;
        file: File;
        isPrivate: boolean;
    } | null>(null);

    // Function to check for existing sessions with same CSV filename
    const checkForDuplicateSession = async (filename: string, userId: string) => {
        try {
            const supabase = createClient();

            // Query sessions where csv_file_path ends with the filename
            const { data: existingSessions, error } = await supabase
                .from('sessions')
                .select('id, player_name, date, csv_file_path')
                .eq('user_id', userId)
                .ilike('csv_file_path', `%${filename}`);

            if (error) {
                console.error('Error checking for duplicate sessions:', error);
                return [];
            }

            // Filter to exact filename matches (in case of similar names)
            return existingSessions?.filter(session => {
                const filePath = session.csv_file_path || '';
                return filePath.endsWith(filename);
            }) || [];
        } catch (error) {
            console.error('Error in checkForDuplicateSession:', error);

            return [];
        }
    };

    const processAndImportFile = async (file: File, isPrivate: boolean = true) => {
        if (!user) {
            alert('You must be logged in to import sessions');
            return;
        }

        // Check for existing sessions with the same filename
        try {
            const duplicateSessions = await checkForDuplicateSession(file.name, user.id);

            if (duplicateSessions.length > 0) {
                const existingSession = duplicateSessions[0];

                // Show dialog instead of confirm
                setDuplicateSessionData({
                    filename: file.name,
                    session: existingSession,
                    file,
                    isPrivate
                });
                setShowDuplicateDialog(true);
                return;
            }
        } catch (error) {
            console.error('Error checking for duplicates:', error);
            // Continue with import if check fails
        }

        // If no duplicates, continue with import
        continueWithImport(file, isPrivate);
    };

    const handleViewExisting = () => {
        if (duplicateSessionData) {
            router.push(`/profile/sessions/${duplicateSessionData.session.id}`);
            setShowDuplicateDialog(false);
            setDuplicateSessionData(null);
        }
    };

    const handleImportAnyway = () => {
        if (duplicateSessionData) {
            setShowDuplicateDialog(false);
            // Continue with the import by calling processAndImportFile with the stored data
            const { file, isPrivate } = duplicateSessionData;
            setDuplicateSessionData(null);

            // Call the import logic directly without duplicate check
            continueWithImport(file, isPrivate);
        }
    };

    const continueWithImport = async (file: File, isPrivate: boolean = true) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const supabase = createClient();

            // Generate unique file path
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = `${user!.id}/${timestamp}-${file.name}`;

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

            alert(`Import failed: ${(err as Error).message}`);
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

            {duplicateSessionData && (
                <DuplicateSessionDialog
                    open={showDuplicateDialog}
                    onViewExisting={handleViewExisting}
                    onImportAnyway={handleImportAnyway}
                    filename={duplicateSessionData.filename}
                    existingSession={duplicateSessionData.session}
                />
            )}
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
