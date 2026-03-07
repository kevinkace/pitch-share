import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import Link from 'next/link';
import Papa from 'papaparse';
import { unstable_cache } from 'next/cache';
import { Card, Flex } from '@radix-ui/themes';

import styles from './SessionList.module.css';

interface SessionData {
    Date: string;
    Time: string;
    'Session Title': string;
    Count: string;
    Speed: string;
    Unit: string;
    'Pitch View': string;
    'Pitch Zone': string;
    'Pitch Type': string;
    'Player Name': string;
    Sport: string;
    Activity: string;
    Video: string;
}

interface PlacementData {
    id: string;
    x: number;
    y: number;
    strike: boolean;
    ground: boolean;
    timestamp: string;
}

export interface SessionSummary {
    id: string;
    date: string;
    time: string;
    playerName: string;
    sessionTitle: string;
    pitchCount: number;
    maxSpeed: number;
    avgSpeed: number;
    unit: string;
    sport: string;
    activity: string;
    hasPlacementData: boolean;
    placementData?: PlacementData[];
}

async function getAllSessionsUncached(): Promise<SessionSummary[]> {
    try {
        const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
        const files = readdirSync(dataDir).filter(file => file.endsWith('.csv') && !file.includes('_placement'));

        return files.map(filename => {
            const filePath = path.join(dataDir, filename);
            const csvContent = readFileSync(filePath, 'utf-8');

            const result = Papa.parse<SessionData>(csvContent, {
                header: true,
                skipEmptyLines: true,
            });

            const data = result.data.filter(row => row.Date && row.Time); // Filter out empty rows

            if (data.length === 0) {
                return null;
            }

            const firstRow = data[0];

            const speeds = data.map(row => parseFloat(row.Speed)).filter(speed => !isNaN(speed));

            const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
            const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;

            // Check for placement data file
            const baseId = filename.replace('.csv', '');
            const placementFileName = `${baseId}_placement.csv`;
            const placementFilePath = path.join(dataDir, placementFileName);

            let hasPlacementData = false;
            let placementData: PlacementData[] = [];

            try {
                const placementCsvContent = readFileSync(placementFilePath, 'utf-8');
                const placementResult = Papa.parse(placementCsvContent, {
                    header: false,
                    skipEmptyLines: true,
                });

                // Handle both formats: with and without headers
                const hasHeaders = placementResult.data[0] && typeof placementResult.data[0][0] === 'string' && placementResult.data[0][0].includes('id');
                const dataRows = hasHeaders ? placementResult.data.slice(1) : placementResult.data;

                placementData = dataRows.map((row: any[]) => ({
                    id: row[0],
                    x: parseFloat(row[1]),
                    y: parseFloat(row[2]),
                    strike: row[3] === 'true',
                    ground: row[4] === 'true',
                    timestamp: row[5]
                })).filter(item => item.id && !isNaN(item.x) && !isNaN(item.y));

                hasPlacementData = placementData.length > 0;
            } catch (placementError) {
                // Placement file doesn't exist or is invalid
                hasPlacementData = false;
            }

      return {
        id: filename.replace('.csv', ''),
        date: firstRow.Date,
        time: firstRow.Time,
        playerName: firstRow['Player Name'] || 'Unknown',
        sessionTitle: firstRow['Session Title'] || 'Training Session',
        pitchCount: data.length,
        maxSpeed,
        avgSpeed,
        unit: firstRow.Unit || 'MPH',
        sport: firstRow.Sport || 'Baseball',
        activity: firstRow.Activity || 'Pitching',
        hasPlacementData,
        placementData: hasPlacementData ? placementData : undefined
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0;

      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }) as SessionSummary[];
  } catch (error) {
    console.error('Error reading session data:', error);
    return [];
  }
}

// Cached version that revalidates every 5 minutes
const getAllSessions = unstable_cache(
    getAllSessionsUncached,
    ['sessions-list'],
    {
        revalidate: 300, // 5 minutes
        tags: ['sessions']
    }
);

export default async function SessionList() {
    const sessions = await getAllSessions();

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