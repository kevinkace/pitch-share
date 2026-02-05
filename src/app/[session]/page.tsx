import Papa from 'papaparse';
import { readFileSync } from 'fs';
import path from 'path';

import SessionDataGrid from './SessionDataGrid';

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

interface SessionPageProps {
  params: Promise<{
    session: string;
  }>;
}

async function loadSessionData(session: string): Promise<SessionData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', `${session}.csv`);
    const csvContent = readFileSync(filePath, 'utf-8');

    const result = Papa.parse<SessionData>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data;
  } catch (error) {
    console.error('Error loading session data:', error);
    return [];
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { session } = await params;

  const data = await loadSessionData(session);

  return (
    <div>
      <h1>Session: {session}</h1>
      {data.length > 0 ? (
        <div>
          <h2>Session Data ({data.length} pitches)</h2>

          <SessionDataGrid data={data} />
        </div>
      ) : (
        <p>No data found for session: {session}</p>
      )}
    </div>
  );
}

// Optional: Generate metadata dynamically based on the session
export async function generateMetadata({ params }: SessionPageProps) {
  const { session } = await params;
  const data = await loadSessionData(session);

  if (data.length === 0) {
    return {
      title: `Session: ${session} | Pitch Share`,
      description: `Session ${session} not found`,
    };
  }

  const firstPitch = data[0];
  const playerName = firstPitch['Player Name'] || 'Unknown Player';
  const sport = firstPitch.Sport || 'Baseball';
  const activity = firstPitch.Activity || 'Pitching';
  const sessionTitle = firstPitch['Session Title'] || `${session} Session`;

  // Calculate some stats
  const speeds = data.map(pitch => parseFloat(pitch.Speed)).filter(speed => !isNaN(speed));
  const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

  return {
    title: `${playerName} - ${sessionTitle || session} | Pitch Share`,
    description: `${sport} ${activity} session with ${data.length} pitches. Average speed: ${avgSpeed} MPH, Max speed: ${maxSpeed} MPH.`,
  };
}