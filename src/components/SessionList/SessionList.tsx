
import Link from 'next/link';
import { Card, Flex } from '@radix-ui/themes';
import { createClient } from '@/lib/supabase/server';

import styles from './SessionList.module.css';

export default async function SessionList() {
    const supabase = await createClient();

    // Get the current user to show their sessions
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className={styles.sessionsContainer}>
                <p>Please log in to view your sessions.</p>
            </div>
        );
    }

    // Fetch user's sessions from the database
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
                <p>No sessions found.</p>
            ) : (
                <Flex wrap="wrap" gap="3">
                    {sessions.map((session) => (
                        <Card
                            asChild
                            key={session.id}
                        >
                            <Link
                                id={session.id}
                                key={session.id}
                                href={`/users/${session.user_id}/sessions/${session.id}`}
                            >
                                <div className={styles.sessionHeader}>
                                    <h3>{session.player_name}</h3>

                                    <span className={styles.sessionId}>
                                        {session.id}
                                    </span>

                                    <span className={styles.sessionDate}>
                                        {new Date(session.date).toLocaleDateString()}
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
                                <div className={styles.sessionMeta}>
                                    {session.sport} • {" "}
                                    {session.activity}
                                    {session.is_private && (
                                        <span className={styles.privateTag}> • Private</span>
                                    )}
                                </div>
                            </Link>

                        </Card>
                    ))}
                </Flex>
            )}
        </div>
    );
}