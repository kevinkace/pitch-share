'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Separator, Card, Flex } from '@radix-ui/themes';
import { PersonIcon, GearIcon, ExitIcon, MixIcon } from "@radix-ui/react-icons"
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from '@/lib/contexts/useAuth';

import { Button } from '@/components/Button/Button';
import UserAvatar from '@/components/UserAvatar/UserAvatar';


import styles from './UserNav.module.css';

export function UserNav() {
    const { user, loading, signOut } = useAuth()
    const [showMenu, setShowMenu] = useState(false);

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading...
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
            href : "/profile",
            icon : <MixIcon />
        },
        {
            label : "Settings",
            href : "/settings",
            icon : <GearIcon />
        }
    ];

    return (
        <div className={styles.userNav}>
            <button onClick={() => setShowMenu(!showMenu)}>
                <UserAvatar user={user} />
            </button>
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className={styles.menu}>
                            <Flex direction="column" gap="2">
                                <Flex gap="3" align="center">
                                    <UserAvatar user={user} />
                                    <Flex direction="column" gap="1" className={styles.names}>
                                        <div className={styles.userName}>
                                            {user.name || "user name"}
                                        </div>
                                        <div className={styles.fullName}>
                                            {user.fullname || "Full Name"}
                                        </div>
                                    </Flex>
                                </Flex>
                                <Separator size="4"/>

                                {menuItems.map(( {label, href, icon} ) => (
                                    <Link href={href} key={label} className={styles.menuItem}>
                                        <span className={styles.menuItemIcon}>{icon}</span>
                                        {label}
                                    </Link>
                                ))}

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