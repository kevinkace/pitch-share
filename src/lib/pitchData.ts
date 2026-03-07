import { readFileSync } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { unstable_cache } from 'next/cache';

export interface PitchData {
  id: string;
  x: number;
  y: number;
  strike: boolean;
  ground: boolean;
  timestamp: string;
}

/**
 * Loads pitch placement data from CSV file (uncached)
 */
async function loadPitchPlacementDataUncached(): Promise<PitchData[]> {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'lib', 'data', 'pitch_placement.csv');
    const csvData = readFileSync(csvPath, 'utf-8');

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Convert numeric fields
        if (field === 'x' || field === 'y') {
          return parseFloat(value);
        }
        // Convert boolean fields
        if (field === 'strike' || field === 'ground') {
          return value.toLowerCase() === 'true';
        }
        return value;
      }
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
    }

    return parsed.data as PitchData[];
  } catch (error) {
    console.error('Error loading pitch placement data:', error);
    return [];
  }
}

/**
 * Cached version of loadPitchPlacementData that revalidates every 5 minutes
 */
export const loadPitchPlacementData = unstable_cache(
  loadPitchPlacementDataUncached,
  ['pitch-placement-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['pitch-placement']
  }
);

/**
 * Filter pitches by date range, useful for session-specific data
 */
export function filterPitchesByDateRange(
  pitches: PitchData[],
  startDate: string,
  endDate?: string
): PitchData[] {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  return pitches.filter(pitch => {
    const pitchDate = new Date(pitch.timestamp);
    return pitchDate >= start && pitchDate <= end;
  });
}

/**
 * Group pitches by date for easier session analysis
 */
export function groupPitchesByDate(pitches: PitchData[]): Record<string, PitchData[]> {
  return pitches.reduce((groups, pitch) => {
    const date = new Date(pitch.timestamp).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(pitch);
    return groups;
  }, {} as Record<string, PitchData[]>);
}