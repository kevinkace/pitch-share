"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Flex, Text, Spinner } from '@radix-ui/themes';

import Container from '@/components/Container/Container';
import PitchTracker from '@/components/PitchTracker/PitchTracker';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

export default function Page() {
    const { user, loading: authLoading } = useAuth();
    const { profile, hasUsername, loading: profileLoading } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        // Redirect to settings if authenticated but no username
        if (!authLoading && !profileLoading && user && !hasUsername) {
            router.push('/profile/settings');
            return;
        }
    }, [user, authLoading, hasUsername, profileLoading, router]);

    // Show loading while checking authentication and profile
    if (authLoading || profileLoading) {
        return (
            <Container>
                <Flex direction="column" align="center" gap="4" style={{ padding: '2rem' }}>
                    <Spinner size="3" />
                    <Text>Loading...</Text>
                </Flex>
            </Container>
        );
    }

    // Show nothing while redirecting (prevents flash)
    if (!user || !hasUsername) {
        return null;
    }

    return (
        <Container width="flex">
            <h1>Pitch Tracker</h1>
            <PitchTracker />
        </Container>
    );
}
