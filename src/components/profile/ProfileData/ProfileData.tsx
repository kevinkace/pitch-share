"use client";

import { Card } from "@radix-ui/themes";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useProfile } from "@/lib/contexts/ProfileContext";

import { DefList } from "@/components/DefList/DefList";

import styles from "./ProfileData.module.css";

const profileKeys = [
    { key: "id", label: "ID" },
    { key: "updated_at", label: "Updated At" },
    { key: "created_at", label: "Created At" },
    { key: "username", label: "Username" },
    { key: "full_name", label: "Full Name" },
    { key: "avatar_url", label: "Avatar URL" },
    { key: "website", label: "Website" },
];

export function ProfileData() {
    const { user } = useAuth();
    const { profile, loading } = useProfile();

    if (!user) return <p>No user data</p>;

    if (loading) return <p>Loading profile...</p>;

    // Combine user auth data with profile data
    const displayData = {
        id: user.id,
        created_at: user.created_at,
        updated_at: profile?.updated_at || "-",
        username: profile?.username || "-",
        full_name: profile?.full_name || user.user_metadata?.full_name || "-",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "-",
        website: profile?.website || "-"
    };

    return (
        <Card size="3" variant="surface" className={styles.card}>
            <h4>Profile data</h4>

            <DefList items={profileKeys.map(({key, label}) => {
                const value = displayData[key as keyof typeof displayData] || "-";
                return { key, label, value };
            })} />
        </Card>
    );
}
