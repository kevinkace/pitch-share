import { ImageResponse } from 'next/og';

import { LogoSVG } from '@/components/LAYOUT/Logo/Logo';

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
          <span>&middot;</span>
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
              <div style={imageStyles.statUnit}>{unit}</div>
            </div>
            <div style={imageStyles.statLabel}>
              Top Speed
            </div>
          </div>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {avgSpeed}
              <div style={imageStyles.statUnit}>{unit}</div>
            </div>
            <div style={imageStyles.statLabel}>
              Average
            </div>
          </div>

          <div style={imageStyles.statCard}>
            <div style={imageStyles.statValue}>
              {medSpeed}
              <div style={imageStyles.statUnit}>{unit}</div>
            </div>
            <div style={imageStyles.statLabel}>
              Median
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={imageStyles.footer}>
          <LogoSVG width={24} height={24} />
          <span>pitchshare.netlify.app</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}