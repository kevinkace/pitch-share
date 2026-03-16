"use client";

import { Card } from "@radix-ui/themes";

import { useAuth } from "@/lib/contexts/useAuth";

import { DefList } from "@/components/defList/DefList";

import styles from "./ProfileData.module.css";

const profileKeys = [
    { key: "id", label: "ID" },
    { key : "updated_at", label: "Updated At" },
    { key: "created_at", label: "Created At" },
    { key : "username", label: "Username" },
    { key: "full_name", label: "Full Name" },
    { key: "avatar_url", label: "Avatar URL" },
    { key : "website", label: "Website" },
];

export function ProfileData() {
    const { user } = useAuth();

    if (!user) return <p>No user data</p>;

    return (
        <Card size="3" variant="surface" className={styles.card}>
            <h4>Profile data</h4>

            <DefList items={profileKeys.map(({key, label}) => {
                const value = user[key as keyof typeof user] || "-";

                return { key, label, value };
            })} />
        </Card>
    );
}
