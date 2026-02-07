export interface SpeedRange {
    min: number;
    max: number;
    color: string;
}

export const SPEED_RANGES: SpeedRange[] = [
    { min: 0, max: 30, color: '#666' },      // gray
    { min: 30, max: 40, color: '#FFEB3B' },  // yellow
    { min: 40, max: 45, color: '#FF5722' },  // orange
    { min: 45, max: 50, color: '#E91E63' },  // red
    { min: 50, max: 100, color: '#673AB7' }, // purple
];

/**
 * Get the color for a given speed based on the defined ranges
 */
export function getSpeedColor(speed: number): string {
    const range = SPEED_RANGES.find(r => speed >= r.min && speed < r.max);

    return range?.color || SPEED_RANGES[SPEED_RANGES.length - 1].color;
}