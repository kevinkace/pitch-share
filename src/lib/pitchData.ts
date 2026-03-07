import { readFileSync, existsSync, readdirSync } from 'fs';
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
 * Loads pitch placement data from CSV files (uncached)
 */
async function loadPitchPlacementDataUncached(): Promise<PitchData[]> {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
    let allPitches: PitchData[] = [];

    // Load from session-specific placement files only
    const files = readdirSync(dataDir);
    const placementFiles = files.filter((file: string) =>
      file.includes('session_placement.csv') && file.endsWith('.csv')
    );

    for (const file of placementFiles) {
      try {
        const csvPath = path.join(dataDir, file);
        const csvData = readFileSync(csvPath, 'utf-8');

        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            if (field === 'x' || field === 'y') {
              return parseFloat(value);
            }
            if (field === 'strike' || field === 'ground') {
              return value.toLowerCase() === 'true';
            }
            return value;
          }
        });

        if (parsed.data && parsed.data.length > 0) {
          allPitches = allPitches.concat(parsed.data as PitchData[]);
        }
      } catch (error) {
        console.warn(`Error loading ${file}:`, error);
      }
    }

    return allPitches;
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