"use client";

import { useState, useEffect } from "react";
import { Dialog, Flex, Text, TextField, Button, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/AuthContext";

import styles from "./UsernameCreation.module.css";

interface UsernameCreationProps {
    open: boolean;
    onClose?: () => void;
    onSuccess: (username: string) => void;
    required?: boolean;
}

export function UsernameCreation({
    open,
    onClose,
    onSuccess,
    required = false
}: UsernameCreationProps) {
    const { user } = useAuth();
    const [username, setUsername] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const supabase = createClient();

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setUsername("");
            setError(null);
            setIsAvailable(null);
        }
    }, [open]);

    // Validate username format
    const isValidUsername = (username: string) => {
        // Username must be 3-30 characters, alphanumeric and underscores only
        const regex = /^[a-zA-Z0-9_]{3,30}$/;
        return regex.test(username);
    };

    // Check username availability
    const checkUsernameAvailability = async (username: string) => {
        if (!username || !isValidUsername(username)) {
            setIsAvailable(null);
            return;
        }

        setIsChecking(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username.toLowerCase())
                .single();

            if (error && error.code === 'PGRST116') {
                // No rows returned - username is available
                setIsAvailable(true);
            } else if (data) {
                // Username exists
                setIsAvailable(false);
            } else if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error checking username availability:', error);
            setError('Failed to check username availability');
        } finally {
            setIsChecking(false);
        }
    };

    // Debounce username availability check
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (username && isValidUsername(username)) {
                checkUsernameAvailability(username);
            } else {
                setIsAvailable(null);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleCreate = async () => {
        if (!user || !username || !isAvailable) return;

        setIsCreating(true);
        setError(null);

        try {
            // Create or update profile with username
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: username.toLowerCase(),
                    full_name: user.user_metadata?.full_name || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;

            onSuccess(username);

            if (onClose) {
                onClose();
            }
        } catch (error: any) {
            console.error('Error creating username:', error);
            if (error.code === '23505') {
                setError('This username is already taken. Please choose another.');
                setIsAvailable(false);
            } else {
                setError('Failed to create username. Please try again.');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const getInputState = () => {
        if (!username) return "default";
        if (!isValidUsername(username)) return "error";
        if (isChecking) return "default";
        if (isAvailable === true) return "success";
        if (isAvailable === false) return "error";
        return "default";
    };

    const getStatusMessage = () => {
        if (!username) return null;
        if (!isValidUsername(username)) {
            return "Username must be 3-30 characters, letters, numbers, and underscores only";
        }
        if (isChecking) return "Checking availability...";
        if (isAvailable === true) return "Username is available!";
        if (isAvailable === false) return "Username is already taken";
        return null;
    };

    return (
        <Dialog.Root open={open} onOpenChange={required ? undefined : onClose}>
            <Dialog.Content style={{ maxWidth: 450 }}>
                <Dialog.Title>
                    {required ? "Choose Your Username" : "Create Username"}
                </Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {required
                        ? "You need to create a username before you can save data or track pitches."
                        : "Create a unique username for your profile."
                    }
                </Dialog.Description>

                <Flex direction="column" gap="4">
                    <div>
                        <Text size="2" weight="medium" mb="2" as="label">
                            Username
                        </Text>
                        <TextField.Root
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            color={getInputState() as any}
                            disabled={isCreating}
                        />

                        {getStatusMessage() && (
                            <Text
                                size="1"
                                color={
                                    isAvailable === true ? "green" :
                                    (isAvailable === false || !isValidUsername(username)) ? "red" :
                                    "gray"
                                }
                                mt="1"
                            >
                                {getStatusMessage()}
                            </Text>
                        )}
                    </div>

                    <Callout.Root color="blue" size="1">
                        <Callout.Icon>
                            <InfoCircledIcon />
                        </Callout.Icon>
                        <Callout.Text>
                            Your username will be public and can be changed once every 60 days.
                        </Callout.Text>
                    </Callout.Root>

                    {error && (
                        <Callout.Root color="red" size="1">
                            <Callout.Icon>
                                <ExclamationTriangleIcon />
                            </Callout.Icon>
                            <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                    )}

                    <Flex gap="3" mt="4" justify="end">
                        {!required && (
                            <Dialog.Close>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                        )}
                        <Button
                            onClick={handleCreate}
                            disabled={!isAvailable || isCreating || isChecking}
                            loading={isCreating}
                        >
                            {required ? "Create Username" : "Save Username"}
                        </Button>
                    </Flex>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}