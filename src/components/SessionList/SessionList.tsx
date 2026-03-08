
import Link from 'next/link';
import { Card, Flex } from '@radix-ui/themes';

import styles from './SessionList.module.css';

export default async function SessionList() {
    const sessions = [];

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
                                href={`/${session.id}`}
                            >
                                <div className={styles.sessionHeader}>
                                    <h3>{session.playerName}</h3>

                                    <span className={styles.sessionId}>
                                        {session.id}
                                    </span>

                                    <span className={styles.sessionDate}>
                                        {new Date(session.date).toLocaleDateString()} at {session.time}
                                    </span>
                                </div>

                                <div className={styles.sessionStats}>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.pitchCount}</span>
                                        <span className={styles.statLabel}>Pitches</span>
                                    </div>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.maxSpeed}</span>
                                        <span className={styles.statLabel}>Max {session.unit}</span>
                                    </div>

                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{session.avgSpeed}</span>
                                        <span className={styles.statLabel}>Avg {session.unit}</span>
                                    </div>

                                </div>
                                <div className={styles.sessionMeta}>
                                    {session.hasPlacementData && (
                                        <div>
                                            Placement Data Available
                                        </div>
                                    )}
                                    {session.sport} • {" "}
                                    {session.activity}
                                </div>
                            </Link>

                        </Card>
                    ))}
                </Flex>
            )}
        </div>
    );
}