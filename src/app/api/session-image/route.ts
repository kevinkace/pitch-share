import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { generateSessionImage } from '@/components/SessionMetadata/SessionMetadata';

export const runtime = 'nodejs';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = searchParams.get('session');

    if (!session) {
      return new Response('Session parameter is required', { status: 400 });
    }

    const data = await loadSessionData(session);

    if (data.length === 0) {
      return new Response('Session not found', { status: 404 });
    }

    // Calculate statistics (same as in page.tsx)
    const speeds = data.map(pitch => parseFloat(pitch.Speed)).filter(speed => !isNaN(speed));
    const unit = data[0]?.Unit || 'MPH';
    const topSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
    const medSpeed = speeds.length > 0 ? Math.round(speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)]) : 0;
    const duration = data.length > 0 ? Math.round((new Date(`${data[data.length - 1].Date} ${data[data.length - 1].Time}`).getTime() - new Date(`${data[0].Date} ${data[0].Time}`).getTime()) / 60000) : 0;

    const playerName = data[0]?.['Player Name'] || 'Unknown Player';
    const date = data[0]?.Date || 'Unknown Date';

    return generateSessionImage({
      playerName,
      date,
      pitchCount: data.length,
      topSpeed,
      avgSpeed,
      medSpeed,
      unit,
      duration
    });
  } catch (error) {
    console.error('Error generating session image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}