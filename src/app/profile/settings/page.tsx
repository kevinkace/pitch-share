"use client";

import { useState } from "react";
import { Flex, Text, Heading, Separator } from "@radix-ui/themes";

import { AvatarUpload } from "@/components/AvatarUpload/AvatarUpload";
import { UsernameEditor } from "@/components/UsernameEditor/UsernameEditor";
import { DataExportButton } from "@/components/DataExportButton/DataExportButton";
import { AccountDeleteButton } from "@/components/AccountDeleteButton/AccountDeleteButton";

export default function SettingsPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    return (
        <Flex direction="column" gap="6" align="start">

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


            <AvatarUpload />

            <Separator size="4"/>


            <UsernameEditor
                onSuccess={(message) => {
                    setSuccess(message);
                    setError(null);
                }}
                onError={(message) => {
                    setError(message);
                    setSuccess(null);
                }}
            />

            <Separator size="4"/>

            {/* Data Export Section */}
            <Heading size="4">Export Your Data</Heading>
            <Text color="gray" size="2">
                Download all your pitch session data, including sessions, individual pitches, and metadata in JSON format.
            </Text>
            <DataExportButton
                onSuccess={(message) => {
                    setSuccess(message);
                    setError(null);
                }}
                onError={(message) => {
                    setError(message);
                    setSuccess(null);
                }}
            />

            <Separator size="4"/>

            {/* Account Deletion Section */}
            <Heading size="4" color="red">Delete Account</Heading>
            <Text color="gray" size="2">
                Permanently delete your account and all associated data. This action cannot be undone.
                All your sessions, pitches, and uploaded CSV files will be permanently removed.
            </Text>

            <AccountDeleteButton
                onSuccess={(message) => {
                    setSuccess(message);
                    setError(null);
                }}
                onError={(message) => {
                    setError(message);
                    setSuccess(null);
                }}
            />
        </Flex>
    );
}
