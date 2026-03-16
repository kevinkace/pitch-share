"use client";

import { useRouter, usePathname } from "next/navigation";
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

import { useAuth } from "@/lib/contexts/useAuth";

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
    const router = useRouter();
    const currentPath = usePathname();

    const pageTitle = userLinks.find(link => link.href === currentPath)?.label || "Profile";

    if (!user && !loading) {
        router.replace("/login");

        return null;
    }

    return (
        <Container>
            <Flex className={styles.container} gap="6" align="stretch">
                {/* Left rail */}
                <Box className={styles.rail}>
                    <Card size="3" className={styles.profileCard}>
                        <Flex direction="column" align="center" gap="3">
                            <Avatar
                                size="7"
                                src={user?.user_metadata?.avatar_url}
                                fallback={user?.email?.[0]?.toUpperCase() ?? "U"}
                                radius="full"
                            />
                            <Heading size="4">
                                {user?.user_metadata?.preferred_username ??
                                    user?.user_metadata?.full_name ??
                                    "User"}
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

                {/* Main content */}
                <Box className={styles.content}>
                    <h2 className={styles.pageTitle}>{pageTitle}</h2>
                    {children}
                </Box>
            </Flex>
        </Container>
    );
}
