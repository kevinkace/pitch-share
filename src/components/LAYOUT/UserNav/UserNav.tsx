'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Separator, Card, Flex } from '@radix-ui/themes';
import { PersonIcon, GearIcon, ExitIcon, ShadowInnerIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from '@/lib/contexts/AuthContext';
import { useProfile } from '@/lib/contexts/ProfileContext';

import { Button } from '@/components/Button/Button';
import UserAvatar from '@/components/USER/UserAvatar/UserAvatar';

import styles from './UserNav.module.css';

export function UserNav() {
    const { user, loading: authLoading, signOut } = useAuth()
    const { profile, loading: profileLoading } = useProfile();
    const [showMenu, setShowMenu] = useState(false);
    const userNavRef = useRef<HTMLDivElement>(null);

    const isLoading = authLoading || profileLoading;

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userNavRef.current && !userNavRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showMenu]);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <UserAvatar profile={null} loading={true} />
            </div>
        )
    }

    if (!user) {
        return (
            <Button href="/login">
                Sign In
            </Button>
        )
    }

    const menuItems = [
        {
            label : "Profile",
            href : "/profile",
            icon : <PersonIcon />
        },
        {
            label : "My sessions",
            href : "/profile/sessions",
            icon : <ShadowInnerIcon />
        },
        {
            label : "Settings",
            href : "/profile/settings",
            icon : <GearIcon />
        }
    ];

    const displayUserName = profile?.username || "Set username";
    const email = profile?.email || user.user_metadata?.email || "Email";

    return (
        <div className={styles.userNav} ref={userNavRef}>
            <button onClick={() => setShowMenu(!showMenu)}>
                <UserAvatar profile={profile} loading={isLoading} />
            </button>
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className={styles.menu}>
                            <Flex direction="column" gap="3">
                                <Flex gap="3" align="center">
                                    <UserAvatar profile={profile} />
                                    <Flex direction="column" gap="1" className={styles.names}>
                                        <div className={styles.userName}>
                                            {displayUserName}
                                        </div>
                                        <div className={styles.fullName}>
                                            {email}
                                        </div>
                                    </Flex>
                                </Flex>
                                <Separator size="4"/>

                                <Flex direction="column" gap="1">
                                    {menuItems.map(( {label, href, icon} ) => (
                                        <Link
                                            href={href}
                                            key={label}
                                            className={styles.menuItem}
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <span className={styles.menuItemIcon}>{icon}</span>
                                            {label}
                                        </Link>
                                    ))}
                                </Flex>

                                <Separator size="4"/>

                                <Button
                                    onClick={() => {
                                        setShowMenu(false);
                                        signOut();
                                    }
                                }>
                                    <ExitIcon /> Sign Out
                                </Button>
                            </Flex>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}