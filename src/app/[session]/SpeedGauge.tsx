'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  unit: string;
}

export default function SpeedGauge({ speed, maxSpeed = 80, unit }: SpeedGaugeProps) {
  // Calculate percentage for gauge
  const percentage = Math.min((speed / maxSpeed) * 100, 100);

  // Create data for the gauge (semicircle)
  const data = [
    { name: 'Speed', value: percentage, fill: '#8884d8' },
    { name: 'Remaining', value: 100 - percentage, fill: '#e0e0e0' }
  ];

  // Color based on speed ranges
  const getSpeedColor = (speed: number) => {
    if (speed >= 60) return '#ff4444'; // Red for very fast
    if (speed >= 50) return '#ff8800'; // Orange for fast
    if (speed >= 40) return '#ffdd00'; // Yellow for medium
    return '#44ff44'; // Green for slow
  };

  const speedColor = getSpeedColor(speed);
  data[0].fill = speedColor;

  return (
    <div style={{ width: '300px', height: '200px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Speed display in center */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: speedColor }}>
          {speed}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {unit}
        </div>
      </div>
    </div>
  );
}