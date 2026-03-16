"use client";

import { useImport } from '@/lib/contexts/ImportContext';
import { requireUsername } from '@/lib/contexts/UsernameContext';

/**
 * Hook that wraps the import functionality with username requirements.
 * Users must have a username before they can upload/import sessions.
 */
export function useImportWithUsernameCheck() {
    const { processAndImportFile, isUploading, uploadProgress } = useImport();

    const processAndImportFileWithCheck = async (file: File, isPrivate: boolean = true) => {
        // Require username before proceeding with import
        const canProceed = requireUsername(() => {
            processAndImportFile(file, isPrivate);
        });

        // If username exists, requireUsername will return true and we don't need to do anything else
        // If username doesn't exist, requireUsername will return false and handle showing the dialog
    };

    return {
        processAndImportFile: processAndImportFileWithCheck,
        isUploading,
        uploadProgress
    };
}