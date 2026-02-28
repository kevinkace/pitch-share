/**
 * Test utility to analyze timestamp alignment between speed and placement data
 * This can be run in a Node.js environment to test the merging functionality
 */

import { readFileSync } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { mergeSpeedAndPlacementData, analyzeTimestampAlignment } from './mergeData';

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

export async function testDataMerging() {
  try {
    // Load session data
    const sessionFilePath = path.join(process.cwd(), 'src', 'lib', 'data', 'PR_20260207_516_session.csv');
    const sessionCsvContent = readFileSync(sessionFilePath, 'utf-8');

    const sessionResult = Papa.parse<SessionData>(sessionCsvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const sessionData = sessionResult.data.filter(row => row.Date && row.Time);

    // Load placement data
    const placementFilePath = path.join(process.cwd(), 'src', 'lib', 'data', 'PR_20260207_516_session_placement.csv');
    const placementCsvContent = readFileSync(placementFilePath, 'utf-8');

    const placementResult = Papa.parse(placementCsvContent, {
      header: false,
      skipEmptyLines: true,
    });

    const placementData: PlacementData[] = placementResult.data.map((row: any[]) => ({
      id: row[0],
      x: parseFloat(row[1]),
      y: parseFloat(row[2]),
      strike: row[3] === 'true',
      ground: row[4] === 'true',
      timestamp: row[5]
    })).filter(item => item.id && !isNaN(item.x) && !isNaN(item.y));

    // Analyze the data
    const analysis = analyzeTimestampAlignment(sessionData, placementData);

    console.log('\n=== TIMESTAMP ANALYSIS RESULTS ===');
    console.log(`Total Speed Entries: ${analysis.totalSpeedEntries}`);
    console.log(`Total Placement Entries: ${analysis.totalPlacementEntries}`);
    console.log(`Potential Matches: ${analysis.potentialMatches}`);
    console.log(`Match Rate: ${((analysis.potentialMatches / analysis.totalSpeedEntries) * 100).toFixed(1)}%`);
    console.log(`Average Delay: ${analysis.averageDelay.toFixed(2)} seconds`);
    console.log(`Delay Range: ${analysis.delayRange.min.toFixed(2)}s - ${analysis.delayRange.max.toFixed(2)}s`);
    console.log(`Unmatched Speed Entries: ${analysis.unmatchedSpeedEntries}`);
    console.log(`Unmatched Placement Entries: ${analysis.unmatchedPlacementEntries}`);

    // Get merged data
    const mergedData = mergeSpeedAndPlacementData(sessionData, placementData);

    console.log('\n=== SAMPLE MERGED DATA ===');

    // Show first few samples with matches
    const samplesWithMatches = mergedData.filter(item => item.placementData).slice(0, 5);
    samplesWithMatches.forEach((item, index) => {
      console.log(`\n--- Sample ${index + 1} ---`);
      console.log(`Pitch #: ${item.sessionData.Count}`);
      console.log(`Speed: ${item.sessionData.Speed} ${item.sessionData.Unit}`);
      console.log(`Speed Time: ${item.sessionData.Date} ${item.sessionData.Time}`);
      if (item.placementData && item.placementTimestamp && item.timeDifference) {
        console.log(`Placement: (${item.placementData.x.toFixed(3)}, ${item.placementData.y.toFixed(3)})`);
        console.log(`Strike: ${item.placementData.strike ? 'Yes' : 'No'}`);
        console.log(`Placement Time: ${item.placementTimestamp.toLocaleString()}`);
        console.log(`Time Difference: ${item.timeDifference.toFixed(2)} seconds`);
      }
    });

    // Show unmatched samples
    const unmatchedSamples = mergedData.filter(item => !item.placementData).slice(0, 3);
    if (unmatchedSamples.length > 0) {
      console.log('\n=== SAMPLE UNMATCHED SPEED DATA ===');
      unmatchedSamples.forEach((item, index) => {
        console.log(`\n--- Unmatched ${index + 1} ---`);
        console.log(`Pitch #: ${item.sessionData.Count}`);
        console.log(`Speed: ${item.sessionData.Speed} ${item.sessionData.Unit}`);
        console.log(`Speed Time: ${item.sessionData.Date} ${item.sessionData.Time}`);
      });
    }

    return {
      analysis,
      mergedData,
      sampleMatches: samplesWithMatches.length,
      totalProcessed: mergedData.length
    };

  } catch (error) {
    console.error('Error testing data merging:', error);
    throw error;
  }
}

// Export for use in other components
export type { SessionData, PlacementData };