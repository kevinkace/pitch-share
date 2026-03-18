import Link from 'next/link';
import { Card, Flex, Grid } from '@radix-ui/themes';

import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/formatters';

import Lock from "@/components/Lock/Lock";

import styles from './SessionList.module.css';

export default async function SessionList() {
    const supabase = await createClient();

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch sessions based on authentication status
    let query = supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (user) {
        // If logged in, show user's own sessions (private and public)
        query = query.eq('user_id', user.id);
    } else {
        // If not logged in, show only public sessions
        query = query.eq('is_private', false);
    }

    const { data: sessions, error } = await query;

    if (error) {
        console.error('Error fetching sessions:', error);
        return (
            <div className={styles.sessionsContainer}>
                <p>Error loading sessions. Please try again.</p>
            </div>
        );
    }

    return (
        <div className={styles.sessionsContainer}>
            {sessions.length === 0 ? (
                <p>{user ? 'No sessions found.' : 'No public sessions available.'}</p>
            ) : (
                <Grid columns="4" gap="3">
                    {sessions.map((session) => (
                        <Card
                            asChild
                            key={session.id}
                        >
                            <Link
                                id={session.id}
                                key={session.id}
                                href={user ? `/profile/sessions/${session.id}` : `/users/${session.user_id}/sessions/${session.id}`}
                            >
                                <div className={styles.sessionHeader}>
                                    <Flex justify="between" align="center">
                                        <h3>{session.player_name}</h3>

                                        {user && user.id === session.user_id && <Lock isLocked={session.is_private} />}
                                    </Flex>

                                    <span className={styles.sessionDate}>
                                        {formatDate(session.date)}
                                    </span>
                                </div>

                                <div className={styles.sessionStats}>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.pitch_count || 0}</span>
                                        <span className={styles.statLabel}>Pitches</span>
                                    </div>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.fastest_speed || '--'}</span>
                                        <span className={styles.statLabel}>Max {session.unit || 'MPH'}</span>
                                    </div>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.average_speed || '--'}</span>
                                        <span className={styles.statLabel}>Avg {session.unit || 'MPH'}</span>
                                    </div>

                                </div>

                                <Flex direction="column" gap="0">
                                    <div className={styles.sessionMeta}>
                                        {session.sport} • {" "}
                                        {session.activity}
                                    </div>
                                    <span className={styles.sessionId}>
                                        {session.id}
                                    </span>
                                </Flex>
                            </Link>

                        </Card>
                    ))}
                </Grid>
            )}
        </div>
    );
}