"use client";

import { useState } from "react";
import { Button, Flex, Text, TextField, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { useUserProfile } from "@/lib/hooks/useUserProfile";

interface UsernameEditorProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export function UsernameEditor({ onSuccess, onError }: UsernameEditorProps) {
    const { profile, loading, canChangeUsername, daysUntilUsernameChange, updateUsername } = useUserProfile();

    // Username editing state
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState(profile?.username || "");
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);

    const handleUsernameUpdate = async () => {
        if (!newUsername.trim()) {
            setUsernameError("Username cannot be empty");
            return;
        }

        // Validate username format
        const regex = /^[a-zA-Z0-9_]{3,30}$/;
        if (!regex.test(newUsername)) {
            setUsernameError("Username must be 3-30 characters, letters, numbers, and underscores only");
            return;
        }

        setIsUpdatingUsername(true);
        setUsernameError(null);

        try {
            await updateUsername(newUsername);
            const successMessage = "Username updated successfully!";
            onSuccess?.(successMessage);
            setIsEditingUsername(false);
        } catch (err: any) {
            const errorMessage = err.message || "Failed to update username";
            setUsernameError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handleStartEdit = () => {
        setIsEditingUsername(true);
        setNewUsername(profile?.username || "");
        setUsernameError(null);
    };

    const handleCancel = () => {
        setIsEditingUsername(false);
        setUsernameError(null);
    };

    // Show loading state to prevent flash of content
    if (loading) {
        return (
            <Flex direction="column" gap="3">
                <Flex align="center" gap="3">
                    <Text size="3" weight="medium" color="gray">
                        Loading username info...
                    </Text>
                </Flex>
            </Flex>
        );
    }

    if (profile?.username && !isEditingUsername) {
        // Display current username with change button
        return (
            <Flex direction="column" gap="3">
                <Flex align="center" gap="3">
                    <Text size="3" weight="medium">
                        Current username: <strong>{profile.username}</strong>
                    </Text>
                    <Button
                        variant="outline"
                        size="2"
                        disabled={!canChangeUsername()}
                        onClick={handleStartEdit}
                    >
                        {canChangeUsername() ? "Change Username" : `Change in ${daysUntilUsernameChange()} days`}
                    </Button>
                </Flex>

                {!canChangeUsername() && profile?.username_updated_at && (
                    <Text color="gray" size="1">
                        Last changed: {new Date(profile.username_updated_at).toLocaleDateString()}
                    </Text>
                )}
            </Flex>
        );
    }

    if (isEditingUsername) {
        // Edit existing username form
        return (
            <Flex direction="column" gap="3">
                <TextField.Root
                    placeholder="Enter new username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={isUpdatingUsername}
                />

                {usernameError && (
                    <Callout.Root color="red" size="1">
                        <Callout.Icon>
                            <ExclamationTriangleIcon />
                        </Callout.Icon>
                        <Callout.Text>{usernameError}</Callout.Text>
                    </Callout.Root>
                )}

                <Flex gap="2">
                    <Button
                        onClick={handleUsernameUpdate}
                        disabled={isUpdatingUsername}
                        loading={isUpdatingUsername}
                        size="2"
                    >
                        Save Username
                    </Button>
                    <Button
                        variant="soft"
                        color="gray"
                        onClick={handleCancel}
                        disabled={isUpdatingUsername}
                        size="2"
                    >
                        Cancel
                    </Button>
                </Flex>
            </Flex>
        );
    }

    // Create new username form (when user has no username)
    return (
        <Flex direction="column" gap="3">
            <Callout.Root color="yellow" size="1">
                <Callout.Icon>
                    <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                    You haven't set a username yet. Create one to start saving pitch data.
                </Callout.Text>
            </Callout.Root>

            <TextField.Root
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={isUpdatingUsername}
            />

            {usernameError && (
                <Callout.Root color="red" size="1">
                    <Callout.Icon>
                        <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text>{usernameError}</Callout.Text>
                </Callout.Root>
            )}

            <Button
                onClick={handleUsernameUpdate}
                disabled={isUpdatingUsername}
                loading={isUpdatingUsername}
                size="2"
            >
                Create Username
            </Button>
        </Flex>
    );
}