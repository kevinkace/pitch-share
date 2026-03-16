"use client";

import { useState } from "react";
import { Button, Flex, Text, Heading, AlertDialog } from "@radix-ui/themes";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleDownloadData = async () => {
        setIsDownloading(true);
        setError(null);
        setSuccess(null);

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

            setSuccess('Your data has been downloaded successfully!');
        } catch (err) {
            console.error('Download error:', err);
            setError(err instanceof Error ? err.message : 'Failed to download data');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
            setError('You must type "DELETE MY ACCOUNT" exactly to confirm');
            return;
        }

        setIsDeleting(true);
        setError(null);
        setSuccess(null);

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

            setSuccess('Your account has been successfully deleted. You will be logged out shortly.');

            // Log out the user and redirect after a short delay
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
            }, 3000);

        } catch (err) {
            console.error('Account deletion error:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Flex direction="column" gap="6" align="start" style={{ maxWidth: '600px' }}>
            <Heading size="6">Account Settings</Heading>

            {error && (
                <Text color="red" size="3">
                    {error}
                </Text>
            )}

            {success && (
                <Text color="green" size="3">
                    {success}
                </Text>
            )}

            {/* Data Export Section */}
            <Flex direction="column" gap="3" style={{ width: '100%' }}>
                <Heading size="4">Export Your Data</Heading>
                <Text color="gray" size="2">
                    Download all your pitch session data, including sessions, individual pitches, and metadata in JSON format.
                </Text>
                <Button
                    onClick={handleDownloadData}
                    disabled={isDownloading}
                    variant="outline"
                    size="3"
                >
                    {isDownloading ? 'Preparing Download...' : 'Download My Data'}
                </Button>
            </Flex>

            {/* Account Deletion Section */}
            <Flex direction="column" gap="3" style={{ width: '100%' }}>
                <Heading size="4" color="red">Delete Account</Heading>
                <Text color="gray" size="2">
                    Permanently delete your account and all associated data. This action cannot be undone.
                    All your sessions, pitches, and uploaded CSV files will be permanently removed.
                </Text>

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
                            <br/>• All pitch sessions and data
                            <br/>• All uploaded CSV files
                            <br/>• Your account profile
                            <br/><br/>
                            This action cannot be undone. To confirm, type <strong>"DELETE MY ACCOUNT"</strong> below:
                        </AlertDialog.Description>

                        <Flex direction="column" gap="3" mt="4">
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type: DELETE MY ACCOUNT"
                                style={{
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />

                            <Flex gap="3" justify="end">
                                <AlertDialog.Cancel>
                                    <Button variant="soft" color="gray">
                                        Cancel
                                    </Button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action>
                                    <Button
                                        color="red"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                                    </Button>
                                </AlertDialog.Action>
                            </Flex>
                        </Flex>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            </Flex>
        </Flex>
    );
}
