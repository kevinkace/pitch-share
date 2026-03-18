"use client";

import { useState } from "react";
import { Button } from "@radix-ui/themes";

import { createClient } from "@/lib/supabase/client";

interface DataExportButtonProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export function DataExportButton({ onSuccess, onError }: DataExportButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadData = async () => {
        setIsDownloading(true);

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('You must be logged in to download your data');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/download-user-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to download data');
            }

            const userData = await response.json();

            // Create and download the file
            const blob = new Blob([JSON.stringify(userData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `pitch-share-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            onSuccess?.('Your data has been downloaded successfully!');
        } catch (err) {
            console.error('Download error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to download data';
            onError?.(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownloadData}
            disabled={isDownloading}
            variant="outline"
            size="3"
        >
            {isDownloading ? 'Preparing Download...' : 'Download My Data'}
        </Button>
    );
}