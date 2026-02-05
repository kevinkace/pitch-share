interface SessionStatsProps {
  speeds: number[];
  unit: string;
}

export default function SessionStats({ speeds, unit }: SessionStatsProps) {
  const fastestPitch = speeds.length > 0 ? Math.max(...speeds) : 0;

  // Calculate speed ranges
  const speedRanges: Record<string, number> = {
    '<30': 0,
    '30-34': 0,
    '35-39': 0,
    '40-44': 0,
    '45-49': 0,
    '50-54': 0,
    '55-59': 0,
    '60+': 0
  };

  speeds.forEach(speed => {
    if (speed < 30) speedRanges['<30']++;
    else if (speed < 35) speedRanges['30-34']++;
    else if (speed < 40) speedRanges['35-39']++;
    else if (speed < 45) speedRanges['40-44']++;
    else if (speed < 50) speedRanges['45-49']++;
    else if (speed < 55) speedRanges['50-54']++;
    else if (speed < 60) speedRanges['55-59']++;
    else speedRanges['60+']++;
  });

  return (
    <div>
      <h3>Session Statistics</h3>

      <p>Fastest Pitch: <strong>{fastestPitch > 0 ? `${fastestPitch} ${unit}` : 'N/A'}</strong></p>

      <h4>Speed Distribution:</h4>
      <ul>
        {Object.entries(speedRanges).map(([range, count]) => (
          <li key={range}>
            {range} {unit}: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}