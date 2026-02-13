"use client"

import React, { useState } from 'react';
import PitchTrackerWithHistory from '@/components/PitchTracker/PitchTrackerWithHistory';
import { useTodaysPitches } from '@/lib/hooks/usePitchData';

export default function PitchPlacementDemo() {
  const { pitches, loading, error, refetch } = useTodaysPitches();

  const handleNewPitch = (pitchData: any) => {
    console.log('New pitch recorded:', pitchData);
    // Refresh the data to include the new pitch
    refetch();
  };

  if (loading) return <div>Loading pitch data...</div>;
  if (error) return <div>Error loading pitch data: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pitch Placement Demo</h1>
      <p>
        This demo shows the enhanced PitchSVG component with historical pitch data visualization.
        You can:
      </p>
      <ul>
        <li>View all pitches from today as baseball markers on the field</li>
        <li>Click on any pitch marker to select/deselect it</li>
        <li>Click anywhere else on the field to record a new pitch</li>
        <li>Selected pitches are highlighted with a green glow and details are shown below</li>
      </ul>

      <div style={{ marginTop: '2rem' }}>
        <PitchTrackerWithHistory
          sessionPitches={pitches}
          onRecord={handleNewPitch}
        />
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h3>Usage Notes:</h3>
        <ul>
          <li>Pitch positions are stored as decimal feet coordinates (x: ±12 feet, y: ±6 feet from strike zone center)</li>
          <li>The ball-sized.svg is positioned based on these coordinates</li>
          <li>Green highlights indicate selected pitches</li>
          <li>Multiple pitches can be selected simultaneously</li>
        </ul>
      </div>
    </div>
  );
}