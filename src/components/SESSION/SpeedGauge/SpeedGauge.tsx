'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { SPEED_RANGES } from '@/lib/speedRanges';
import SpeedColorIndicator from '@/components/SESSION/SpeedColorIndicator/SpeedColorIndicator';

import styles from './SpeedGauge.module.css';

interface SpeedGaugeProps {
    speed: number;
    speeds?: number[]; // Array of all pitch speeds for distribution
    unit: string;
}

export default function SpeedGauge({ speed, speeds = [], unit }: SpeedGaugeProps) {
    // Create fixed range segments from 0-100
    const rangeData = SPEED_RANGES.map(range => {
        const rangeSize = range.max - range.min;
        return {
            name: `${range.min}-${range.max} ${unit}`,
            value: rangeSize, // Fixed size based on range span
            fill: range.color,
            isEmpty: false
        };
    });

    // Calculate needle angle (180° = 0 MPH at 9 o'clock, 0° = 100 MPH at 3 o'clock)
    // For a half-circle from 180° to 0°, we need to map 0-100 to this range
    const needleAngle = 180 - (speed / 100) * 180;

    const needleLength = 55;
    const centerX = 150; // 50% of 300px width
    const centerY = 130; // 90% of 200px height

    // Calculate needle tip coordinates
    // needleAngle is already in the correct coordinate system (180° = left, 0° = right)
    const needleX = centerX + needleLength * Math.cos(needleAngle * Math.PI / 180);
    const needleY = centerY - needleLength * Math.sin(needleAngle * Math.PI / 180);

    return (
        <div className={styles.container}>
            {rangeData.length ?
            (<>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={rangeData}
                        cx="50%"
                        cy="60%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={40}
                        outerRadius={120}
                        dataKey="value"
                    >
                        {rangeData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.isEmpty ? '#f0f0f0' : entry.fill}
                                stroke={entry.isEmpty ? '#ddd' : 'none'}
                                strokeWidth={entry.isEmpty ? 1 : 0}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Needle */}
            <svg className={styles.needle}>
                {/* Needle line */}
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={needleX}
                    y2={needleY}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                {/* Center dot */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r="5"
                    fill="currentColor"
                />
            </svg>

            {/* Speed display in center */}
            <div className={styles.speedDisplay}>
                <div className={styles.speedValue}>
                    {speed}
                </div>
                <div className={styles.speedUnit}>
                    {unit}
                </div>
            </div>

            {/* color legend */}
            <div className={styles.legend}>
                {SPEED_RANGES.map((range, index) => (
                    <div key={index} className={styles.legendItem}>
                        <SpeedColorIndicator
                            color={range.color}
                            className={styles.legendColor}
                        />

                        <div className={styles.legendText}>
                            {`${range.min}-${range.max}`} <br /> {unit}
                        </div>
                    </div>
                ))}
            </div>
            </>) : <p>No speed data available.</p>}

        </div>
    );
}