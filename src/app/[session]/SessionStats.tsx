'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SpeedGauge from './SpeedGauge';

interface SessionStatsProps {
  speeds: number[];
  unit: string;
}

export default function SessionStats({ speeds, unit }: SessionStatsProps) {
  const fastestPitch = speeds.length > 0 ? Math.max(...speeds) : 0;

  // Calculate frequency for each individual speed
  const speedCounts: Record<number, number> = {};
  speeds.forEach(speed => {
    speedCounts[speed] = (speedCounts[speed] || 0) + 1;
  });

  // Create continuous range from min to max speed
  const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  const chartData = [];

  for (let speed = minSpeed; speed <= maxSpeed; speed++) {
    chartData.push({
      speed,
      count: speedCounts[speed] || 0
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', marginBottom: '20px' }}>
        <div>
          <h3>Top Speed</h3>
          <SpeedGauge speed={fastestPitch} speeds={speeds} unit={unit} />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Speed Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="speed"
                label={{ value: `Speed (${unit})`, position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => [value, 'Pitches']}
                labelFormatter={(label) => `${label} ${unit}`}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}