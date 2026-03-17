"use client";

import { useState } from "react";
import { Button, Flex, AlertDialog } from "@radix-ui/themes";

import { createClient } from "@/lib/supabase/client";

const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

interface AccountDeleteButtonProps {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export function AccountDeleteButton({ onSuccess, onError }: AccountDeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== DELETE_CONFIRMATION_TEXT) {
            onError?.(`You must type "${DELETE_CONFIRMATION_TEXT}" exactly to confirm`);
            return;
        }

        setIsDeleting(true);

        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('You must be logged in to delete your account');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-user-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    confirmation: deleteConfirmation
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete account');
            }

            if (response.status === 207) {
                // Partial success
                console.warn('Account deletion completed with some errors:', result.details);
            }

            onSuccess?.('Your account has been successfully deleted. You will be logged out shortly.');

            // Log out the user and redirect after a short delay
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
            }, 3000);

        } catch (err) {
            console.error('Account deletion error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
            onError?.(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setDeleteConfirmation("");
    };

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <Button
                    color="red"
                    variant="outline"
                    size="3"
                >
                    Delete My Account
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Title>Delete Account Confirmation</AlertDialog.Title>
                <AlertDialog.Description size="2">
                    This will permanently delete your account and all data including:

                    <ul>
                        <li>All pitch sessions and data</li>
                        <li>All uploaded CSV files</li>
                        <li>Your account profile</li>
                    </ul>

                    This action cannot be undone. To confirm, type <strong>"{DELETE_CONFIRMATION_TEXT}"</strong> below:
                </AlertDialog.Description>

                <Flex direction="column" gap="3" mt="4">
                    <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={`Type: ${DELETE_CONFIRMATION_TEXT}`}
                        style={{
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />

                    <Flex gap="3" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button
                                color="red"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmation !== DELETE_CONFIRMATION_TEXT}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}