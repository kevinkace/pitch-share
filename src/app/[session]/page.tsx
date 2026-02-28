import { readFileSync } from 'fs';
import path from 'path';

import Papa from 'papaparse';

import SessionDataGrid from '@/components/SessionDataGrid/SessionDataGrid';
import SessionStats from '@/components/SessionStats/SessionStats';
import SessionSummary from '@/components/SessionSummary/SessionSummary';
import SpeedGauge from '@/components/SpeedGauge/SpeedGauge';
import SessionNavigation from '@/components/SessionNavigation/SessionNavigation';
import { getSessionNavigation } from '@/lib/sessionNavigation';

import style from './page.module.css';
import { Flex } from '@radix-ui/themes';
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
  const { previousSession, nextSession, previousDate, nextDate } = await getSessionNavigation(session);

  // Calculate statistics
  const speeds = data.map(pitch => parseFloat(pitch.Speed)).filter(speed => !isNaN(speed));
  const unit = data[0]?.Unit || 'MPH';
  const fastestPitch = speeds.length > 0 ? Math.max(...speeds) : 0;
  const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
  const medSpeed = speeds.length > 0 ? Math.round(speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)]) : 0;
  // total duration using first and last row
  const duration = data.length > 0 ? Math.round((new Date(`${data[data.length - 1].Date} ${data[data.length - 1].Time}`).getTime() - new Date(`${data[0].Date} ${data[0].Time}`).getTime()) / 60000) : 0;

  const date = data[0]?.Date || 'Unknown Date';
  const startTime = data[0]?.Time || 'Unknown Time';

  return (
    <>
      <div className={style.topBar}>
        <div>
          <h1 className={style.header}>
            {data[0]?.['Player Name'] || 'Unknown'}
          </h1>
        {/* date */}
        <div className={style.date}>
          <div>{date}</div>
          <div>{startTime}</div>
          <div>{duration} min</div>
        </div>
      </div>

        <SessionNavigation
          previousSession={previousSession}
          nextSession={nextSession}
          previousDate={previousDate}
          nextDate={nextDate}
          inline={true}
        />

      </div>



      {data.length > 0 ? (
        <>
          <SessionSummary
            pitchCount={data.length}
            topSpeed={fastestPitch}
            avgSpeed={avgSpeed}
            medSpeed={medSpeed}
            unit={unit}
          />

          <Flex className={style.gaugeStats} align="center">
            <SpeedGauge speed={fastestPitch} speeds={speeds} unit={unit} />

            <SessionStats speeds={speeds} unit={unit} />
          </Flex>

          <SessionDataGrid data={data} />
        </>
      ) : (
        <p>No data found for session: {session}</p>
      )}

      <SessionNavigation
        previousSession={previousSession}
        nextSession={nextSession}
        previousDate={previousDate}
        nextDate={nextDate}
      />
    </>
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
  const unit = data[0]?.Unit || 'MPH';
  const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

  // Generate absolute image URL for OG tags
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === 'production'
    ? 'https://pitchshare.netlify.app'
    : 'http://localhost:3000';

  const imageUrl = `${baseUrl}/api/session-image?session=${encodeURIComponent(session)}`;

  return {
    title: `${playerName} - ${sessionTitle || session} | Pitch Share`,
    description: `${sport} ${activity} session with ${data.length} pitches. Average speed: ${avgSpeed} MPH, Max speed: ${maxSpeed} MPH.`,
    openGraph: {
      title: `${playerName} - ${sessionTitle || session}`,
      description: `${sport} ${activity} session with ${data.length} pitches. Average: ${avgSpeed} ${unit}, Max: ${maxSpeed} ${unit}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${playerName} pitching session stats`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${playerName} - ${sessionTitle || session}`,
      description: `${sport} ${activity} session with ${data.length} pitches. Average: ${avgSpeed} ${unit}, Max: ${maxSpeed} ${unit}`,
      images: [imageUrl],
    },
  };
}