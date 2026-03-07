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

interface MergedPitchData {
  sessionData: SessionData;
  placementData?: PlacementData;
  speedTimestamp: Date;
  placementTimestamp?: Date;
  timeDifference?: number; // in seconds
}

/**
 * Converts session data timestamp (Date + Time columns) to a proper Date object
 * Handles formats like "2/7/2026" and "5:16:58 PM"
 */
function parseSessionTimestamp(date: string, time: string): Date {
  // Clean up the date and time strings
  const cleanDate = date.trim();
  const cleanTime = time.trim();

  // Combine date and time for parsing
  const dateTimeString = `${cleanDate} ${cleanTime}`;

  return new Date(dateTimeString);
}

/**
 * Converts placement timestamp (ISO format) to Date object
 */
function parsePlacementTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Finds the placement data that occurs 1-5 seconds after a given speed measurement
 * @param speedTimestamp - The timestamp of the speed measurement
 * @param placementData - Array of all placement data
 * @param minDelayMs - Minimum delay in milliseconds (default: 1000ms)
 * @param maxDelayMs - Maximum delay in milliseconds (default: 5000ms)
 * @returns The matching placement data or null if no match found
 */
function findMatchingPlacement(
  speedTimestamp: Date,
  placementData: PlacementData[],
  minDelayMs: number = 1000,
  maxDelayMs: number = 5000
): PlacementData | null {
  const speedTime = speedTimestamp.getTime();

  // Find placement data within the time window
  const candidates = placementData
    .map(placement => ({
      placement,
      placementTime: parsePlacementTimestamp(placement.timestamp).getTime(),
    }))
    .filter(({ placementTime }) => {
      const timeDiff = placementTime - speedTime;
      return timeDiff >= minDelayMs && timeDiff <= maxDelayMs;
    })
    .sort((a, b) =>
      Math.abs(a.placementTime - speedTime - 2500) -
      Math.abs(b.placementTime - speedTime - 2500)
    ); // Sort by proximity to 2.5s (middle of 1-5s range)

  return candidates.length > 0 ? candidates[0].placement : null;
}

/**
 * Merges session data (speed) with placement data based on temporal alignment
 * @param sessionData - Array of session pitch data with speed measurements
 * @param placementData - Array of placement data
 * @param minDelayMs - Minimum delay between speed and placement (default: 1000ms)
 * @param maxDelayMs - Maximum delay between speed and placement (default: 5000ms)
 * @returns Array of merged pitch data with aligned speed and placement information
 */
export function mergeSpeedAndPlacementData(
  sessionData: SessionData[],
  placementData: PlacementData[],
  minDelayMs: number = 1000,
  maxDelayMs: number = 5000
): MergedPitchData[] {
  // Keep track of used placement data to avoid duplicates
  const usedPlacementIds = new Set<string>();

  const mergedData: MergedPitchData[] = sessionData.map(speedEntry => {
    const speedTimestamp = parseSessionTimestamp(speedEntry.Date, speedEntry.Time);

    // Find available placement data (not already used)
    const availablePlacementData = placementData.filter(p => !usedPlacementIds.has(p.id));

    const matchingPlacement = findMatchingPlacement(
      speedTimestamp,
      availablePlacementData,
      minDelayMs,
      maxDelayMs
    );

    // Mark placement as used if found
    if (matchingPlacement) {
      usedPlacementIds.add(matchingPlacement.id);
    }

    const result: MergedPitchData = {
      sessionData: speedEntry,
      speedTimestamp,
    };

    if (matchingPlacement) {
      const placementTimestamp = parsePlacementTimestamp(matchingPlacement.timestamp);
      result.placementData = matchingPlacement;
      result.placementTimestamp = placementTimestamp;
      result.timeDifference = (placementTimestamp.getTime() - speedTimestamp.getTime()) / 1000;
    }

    return result;
  });

  return mergedData;
}

/**
 * Analyzes the temporal alignment between speed and placement data
 * @param sessionData - Array of session pitch data
 * @param placementData - Array of placement data
 * @returns Analysis results including match statistics and timing information
 */
export function analyzeTimestampAlignment(
  sessionData: SessionData[],
  placementData: PlacementData[]
): {
  totalSpeedEntries: number;
  totalPlacementEntries: number;
  potentialMatches: number;
  averageDelay: number;
  delayRange: { min: number; max: number };
  unmatchedSpeedEntries: number;
  unmatchedPlacementEntries: number;
} {
  const mergedData = mergeSpeedAndPlacementData(sessionData, placementData);

  const matchedEntries = mergedData.filter(entry => entry.placementData);
  const delays = matchedEntries
    .map(entry => entry.timeDifference!)
    .filter(delay => !isNaN(delay));

  const averageDelay = delays.length > 0
    ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length
    : 0;

  const delayRange = delays.length > 0
    ? { min: Math.min(...delays), max: Math.max(...delays) }
    : { min: 0, max: 0 };

  return {
    totalSpeedEntries: sessionData.length,
    totalPlacementEntries: placementData.length,
    potentialMatches: matchedEntries.length,
    averageDelay,
    delayRange,
    unmatchedSpeedEntries: sessionData.length - matchedEntries.length,
    unmatchedPlacementEntries: placementData.length - matchedEntries.length,
  };
}

export type { SessionData, PlacementData, MergedPitchData };