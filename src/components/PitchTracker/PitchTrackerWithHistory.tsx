"use client"

import React, { useState, useEffect } from 'react';
import PitchSVG from './PitchSVG';

interface PitchData {
  id: string;
  x: number;
  y: number;
  strike: boolean;
  ground: boolean;
  timestamp: string;
}

interface Props {
  sessionPitches?: PitchData[];
  onRecord: (row: any) => void;
}

/**
 * Enhanced PitchTracker that can display historical pitches
 * and track new ones
 */
export default function PitchTrackerWithHistory({ sessionPitches = [], onRecord }: Props) {
  const [selectedPitchIds, setSelectedPitchIds] = useState<string[]>([]);

  const handlePitchClick = (pitch: PitchData) => {
    setSelectedPitchIds(prev => {
      if (prev.includes(pitch.id)) {
        // Deselect if already selected
        return prev.filter(id => id !== pitch.id);
      } else {
        // Add to selection (allow multiple selections)
        return [...prev, pitch.id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedPitchIds([]);
  };

  const selectedPitches = sessionPitches.filter(pitch =>
    selectedPitchIds.includes(pitch.id)
  );

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div>Historical Pitches: {sessionPitches.length}</div>
        <div>Selected Pitches: {selectedPitchIds.length}</div>
        {selectedPitchIds.length > 0 && (
          <button onClick={clearSelection} style={{ marginTop: '0.5rem' }}>
            Clear Selection
          </button>
        )}
      </div>

      <PitchSVG
        onRecord={onRecord}
        pitches={sessionPitches}
        selectedPitchIds={selectedPitchIds}
        onPitchClick={handlePitchClick}
      />

      {selectedPitches.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Selected Pitch Details:</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {selectedPitches.map(pitch => (
              <div key={pitch.id} style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                margin: '0.25rem 0',
                fontSize: '0.9rem'
              }}>
                <div>ID: {pitch.id.slice(0, 8)}...</div>
                <div>Position: ({pitch.x.toFixed(2)}, {pitch.y.toFixed(2)}) feet</div>
                <div>Strike: {pitch.strike ? 'Yes' : 'No'} | Ground: {pitch.ground ? 'Yes' : 'No'}</div>
                <div>Time: {new Date(pitch.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}