import { ImageResponse } from 'next/og';

import { imageStyles } from './SessionMetadata.module.css';

interface SessionMetadataProps {
  playerName: string;
  date: string;
  pitchCount: number;
  topSpeed: number;
  avgSpeed: number;
  medSpeed: number;
  unit: string;
  duration: number;
}

export function generateSessionImage({
  playerName,
  date,
  pitchCount,
  topSpeed,
  avgSpeed,
  medSpeed,
  unit,
  duration
}: SessionMetadataProps) {
  return new ImageResponse(
    (
      <div style={imageStyles.container}>
        {/* Header */}
        <div style={imageStyles.header}>
          <h1 style={imageStyles.playerName}>
            {playerName}
          </h1>
        </div>

        {/* Date and Duration */}
        <div style={imageStyles.dateSection}>
          <span>{date}</span>
          <span>•</span>
          <span>{duration} min</span>
        </div>

        {/* Stats Grid */}
        <div style={imageStyles.statsGrid}>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {pitchCount}
            </div>
            <div style={imageStyles.statLabel}>
              Pitches
            </div>
          </div>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {topSpeed}
            </div>
            <div style={imageStyles.statLabel}>
              Top Speed ({unit})
            </div>
          </div>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {avgSpeed}
            </div>
            <div style={imageStyles.statLabel}>
              Average ({unit})
            </div>
          </div>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {medSpeed}
            </div>
            <div style={imageStyles.statLabel}>
              Median ({unit})
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={imageStyles.footer}>
          Pitch Share
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}