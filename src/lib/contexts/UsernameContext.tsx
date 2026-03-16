"use client";

import { useState } from 'react';
import { UsernameCreation } from '@/components/UsernameCreation/UsernameCreation';
import { useUsernameRequirement } from '@/lib/hooks/useUsernameRequirement';

interface UsernameProviderProps {
    children: React.ReactNode;
}

export function UsernameProvider({ children }: UsernameProviderProps) {
    const {
        showUsernameDialog,
        isRequired,
        requireUsernameForAction,
        handleUsernameSuccess,
        handleDialogClose
    } = useUsernameRequirement();

    // Store the action function in the global scope so it can be accessed by hooks
    if (typeof window !== 'undefined') {
        (window as any).requireUsernameForAction = requireUsernameForAction;
    }

    return (
        <>
            {children}

            {/* Username creation dialog */}
            <UsernameCreation
                open={showUsernameDialog}
                onClose={handleDialogClose}
                onSuccess={handleUsernameSuccess}
                required={isRequired}
            />
        </>
    );
}

// Helper function to access the requireUsername functionality from anywhere
export function requireUsername(action: () => void): boolean {
    if (typeof window !== 'undefined' && (window as any).requireUsernameForAction) {
        return (window as any).requireUsernameForAction(action);
    }
    // Fallback: if username requirement system isn't available, just execute the action
    action();
    return true;
}