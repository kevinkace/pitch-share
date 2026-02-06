'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './SpeedGauge.module.css';

interface SpeedGaugeProps {
  speed: number;
  speeds?: number[]; // Array of all pitch speeds for distribution
  unit: string;
}

export default function SpeedGauge({ speed, speeds = [], unit }: SpeedGaugeProps) {
  // Define speed ranges (in 10 MPH increments for simplicity)
  const ranges = [
    { min: 0, max: 30, color: '#666' },    // Green
    { min: 30, max: 40, color: '#FFEB3B' },   // Yellow
    { min: 40, max: 45, color: '#FF5722' },   // Deep Orange
    { min: 45, max: 50, color: '#E91E63' },   // Pink
    { min: 50, max: 100, color: '#673AB7' },  // Deep Purple
  ];

  // Count pitches in each range
  const rangeData = ranges.map(range => {
    const count = speeds.filter(s => s >= range.min && s < range.max).length;
    return {
      name: `${range.min}-${range.max} ${unit}`,
      value: count > 0 ? count : 0.1, // Minimum value to show empty ranges
      fill: range.color,
      isEmpty: count === 0
    };
  });

  // Calculate needle angle (180° = 0 MPH at 9 o'clock, 0° = 100 MPH at 3 o'clock)
  const needleAngle = 180 - (speed / 100) * 180;
  const needleLength = 75;
  const centerX = 150; // 50% of 300px width
  const centerY = 180; // 90% of 200px height

  // Calculate needle tip coordinates
  const needleX = centerX + needleLength * Math.cos((needleAngle - 90) * Math.PI / 180);
  const needleY = centerY + needleLength * Math.sin((needleAngle - 90) * Math.PI / 180);

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rangeData}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
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

      {/* color legend */}
      <div className={styles.legend}>
        {ranges.map((range, index) => (
          <div key={index} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: range.color }}
            ></div>

            <div className={styles.legendText}>
              {`${range.min}-${range.max} ${unit}`}
              </div>
          </div>
        ))}
      </div>

      {/* Speed display in center */}
      <div className={styles.speedDisplay}>
        <div className={styles.speedValue}>
          {speed}
        </div>
        <div className={styles.speedUnit}>
          {unit}
        </div>
      </div>
    </div>
  );
}