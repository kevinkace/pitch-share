import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import Link from 'next/link';
import Papa from 'papaparse';
import { unstable_cache } from 'next/cache';
import styles from './page.module.css';

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

export interface SessionSummary {
  id: string;
  date: string;
  time: string;
  playerName: string;
  pitchCount: number;
  maxSpeed: number;
  avgSpeed: number;
  unit: string;
  sport: string;
  activity: string;
}

function getAllSessionsUncached(): SessionSummary[] {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
    const files = readdirSync(dataDir).filter(file => file.endsWith('.csv'));

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

      return {
        id: filename.replace('.csv', ''),
        date: firstRow.Date,
        time: firstRow.Time,
        playerName: firstRow['Player Name'] || 'Unknown',
        pitchCount: data.length,
        maxSpeed,
        avgSpeed,
        unit: firstRow.Unit || 'MPH',
        sport: firstRow.Sport || 'Baseball',
        activity: firstRow.Activity || 'Pitching'
      };
    }).filter(Boolean) as SessionSummary[];
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
        <div className={styles.sessionGrid}>
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/${session.id}`}
              className={styles.sessionCard}
            >
              <div className={styles.sessionHeader}>
                <h3>{session.playerName}</h3>
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
                {session.sport} • {session.activity}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}