"use client";

import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';

export function useUsernameRequirement() {
    const { profile, hasUsername, loading } = useUserProfile();
    const [showUsernameDialog, setShowUsernameDialog] = useState(false);
    const [isRequired, setIsRequired] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Check if we should show the username creation dialog on load
    useEffect(() => {
        if (!loading && profile && !hasUsername) {
            // User has a profile but no username - show dialog as optional initially
            setShowUsernameDialog(true);
            setIsRequired(false);
        }
    }, [loading, profile, hasUsername]);

    // Function to require username before proceeding with an action
    const requireUsernameForAction = (action: () => void) => {
        if (hasUsername) {
            // Username exists, proceed with action
            action();
            return true;
        }

        // Username required, show dialog and store pending action
        setPendingAction(() => action);
        setIsRequired(true);
        setShowUsernameDialog(true);
        return false;
    };

    // Handle successful username creation
    const handleUsernameSuccess = (username: string) => {
        setShowUsernameDialog(false);
        setIsRequired(false);

        // Execute pending action if any
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    // Handle dialog close (only allowed when not required)
    const handleDialogClose = () => {
        if (!isRequired) {
            setShowUsernameDialog(false);
            setPendingAction(null);
        }
    };

    return {
        showUsernameDialog,
        isRequired,
        requireUsernameForAction,
        handleUsernameSuccess,
        handleDialogClose,
        hasUsername
    };
}