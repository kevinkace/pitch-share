"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Avatar,
    Box,
    Card,
    Flex,
    Heading,
    Text,
    Separator,
} from "@radix-ui/themes";

import Container from "@/components/Container/Container";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useProfile } from "@/lib/contexts/ProfileContext";

import styles from "./layout.module.css";

const userLinks = [
    {
        href: "/profile",
        label: "profile",
        icon: "profile"
    },
    {
        href: "/profile/sessions",
        label: "my sessions",
        icon: "file"
    },
    {
        href: "/profile/settings",
        label: "settings",
        icon: "settings"
    }
];

export default function ProfileLayout({ children }: { children: React.ReactNode; }) {
    const { user, loading } = useAuth();
    const { profile } = useProfile();
    const currentPath = usePathname();

    // Check if we're on a session detail page
    const isSessionDetailPage = /^\/profile\/sessions\/[^/]+$/.test(currentPath);

    const pageTitle = userLinks.find(link => link.href === currentPath)?.label || "Profile";

    // Show loading state while auth is being determined
    if (loading) {
        return (
            <Container>
                <Box p="4">
                    <Text>Loading...</Text>
                </Box>
            </Container>
        );
    }

    // At this point, middleware ensures user exists for /profile routes

    const displayName = profile?.username ||
                       user?.user_metadata?.preferred_username ||
                       user?.user_metadata?.full_name ||
                       "User";

    const avatar_url = profile?.avatar_url || user?.user_metadata?.avatar_url;

    return (
        <Container>
            <Flex className={styles.container} gap="6" align="stretch">
                {/* Left rail - hidden on session detail pages */}
                {!isSessionDetailPage && (
                    <>
                        <Box className={styles.rail}>
                            <Card size="3" className={styles.profileCard}>
                                <Flex direction="column" align="center" gap="3">
                                    <Avatar
                                        size="7"
                                        src={avatar_url}
                                        fallback={user?.email?.[0]?.toUpperCase() ?? "U"}
                                        radius="full"
                                    />
                                    <Heading size="4">
                                        {displayName}
                                    </Heading>
                                    <Text color="gray" size="2">
                                        {user?.email}
                                    </Text>
                                </Flex>
                            </Card>

                            <nav className={styles.nav}>
                                {userLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={link.href === currentPath ? styles.navLinkActive : styles.navLink}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </Box>

                        {/* Full-height separator */}
                        <Separator orientation="vertical" className={styles.separator} color="gray" size="4" />
                    </>
                )}

                {/* Main content */}
                <Box className={styles.content}>
                    {!isSessionDetailPage && (<><h2 className={styles.pageTitle}>{pageTitle}</h2></>)}
                    {children}
                </Box>
            </Flex>
        </Container>
    );
}
