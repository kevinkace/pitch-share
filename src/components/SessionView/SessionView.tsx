'use client';

import { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { TrashIcon } from '@radix-ui/react-icons';

import 'ag-grid-community/styles/ag-theme-alpine.css';

import SessionSummary from '@/components/SessionSummary/SessionSummary';
import SessionStats from '@/components/SessionStats/SessionStats';
import SessionNavigation from '@/components/SessionNavigation/SessionNavigation';
import Container from '@/components/Container/Container';
import SpeedGauge from '@/components/SpeedGauge/SpeedGauge';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';
import SessionOwnershipBadge from '@/components/SessionOwnershipBadge/SessionOwnershipBadge';
import { useSession } from '@/lib/contexts/SessionContext';

import { getSpeedColor } from '@/lib/speedRanges';

import style from './SessionView.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface SessionViewProps {
  emptyMessage?: string; // Custom message when no pitch data
}

export default function SessionView({
  emptyMessage = 'No pitch data found for this session.'
}: SessionViewProps) {
  const {
    sessionData,
    pitches,
    loading,
    error,
    sessionMeta,
    pitchSpeeds,
    sessionId,
    isOwner,
    deletePitch
  } = useSession();

  const [deletingPitchId, setDeletingPitchId] = useState<string | null>(null);

  if (loading) {
    return (
      <Container>
        <p>Loading session...</p>
      </Container>
    );
  }

  if (error || !sessionData) {
    return (
      <Container>
        <p>Session not found</p>
      </Container>
    );
  }

  // Handler to delete a pitch with confirmation
  const handleDeletePitch = async (pitchId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this pitch? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeletingPitchId(pitchId);

    try {
      await deletePitch(pitchId);
    } catch (err) {
      console.error('Error deleting pitch:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete pitch. Please try again.');
    } finally {
      setDeletingPitchId(null);
    }
  };

  // Column definitions for the data grid
  const columnDefs: ColDef[] = [
    { field: 'count', headerName: '#', type: 'numericColumn', width: 80 },
    { field: 'date', width: 120 },
    { field: 'time', width: 100 },
    {
      field: 'speed',
      type: 'numericColumn',
      width: 120,
      cellRenderer: (params: { value: number }) => {
        if (!params.value) return '';
        const speed = parseFloat(params.value);
        const unit = sessionData.unit || 'MPH';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SpeedColorIndicator color={getSpeedColor(speed)} />
            {params.value} {unit}
          </div>
        );
      }
    },
    { field: 'pitch_type', headerName: 'Type', width: 120 },
    { field: 'pitch_zone', headerName: 'Zone', width: 120 },
    { field: 'pitch_view', headerName: 'View', width: 120 },
    // Conditionally add actions column for session owners
    ...(isOwner ? [{
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: { data: { id: string } }) => {
        const isDeleting = deletingPitchId === params.data.id;
        return (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <button
              onClick={() => handleDeletePitch(params.data.id)}
              disabled={isDeleting}
              style={{
                background: 'none',
                border: 'none',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDeleting ? '#999' : '#ef4444',
                opacity: isDeleting ? 0.5 : 1
              }}
              title="Delete pitch"
            >
              <TrashIcon width="16" height="16" />
            </button>
          </div>
        );
      }
    }] : [])
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <Container>
      <div className={style.topBar}>
        <h1 className={style.header}>
          {sessionMeta.player}
        </h1>

        <div className={style.date}>
          <div>{sessionMeta.date}</div>
          <div>{sessionMeta.startTime}</div>
          <div>{sessionMeta.duration} min</div>
        </div>

        <SessionNavigation session={sessionId} inline={true} />

        <SessionOwnershipBadge />

      </div>

      {pitches && pitches.length > 0 ? (
        <>
          <SessionSummary
            pitchCount={sessionData.pitch_count || 0}
            topSpeed={sessionMeta.topSpeed}
            avgSpeed={sessionMeta.avgSpeed}
            medSpeed={sessionMeta.medSpeed}
            unit={sessionMeta.unit}
            fastestStrike={sessionMeta.fastestStrike}
          />

          <Flex className={style.gaugeStats} align="center">
            <SpeedGauge
              speed={sessionMeta.topSpeed}
              speeds={pitchSpeeds}
              unit={sessionMeta.unit}
            />
            <SessionStats
              speeds={pitchSpeeds}
              unit={sessionMeta.unit}
            />
          </Flex>

          {/* Pitch Data Grid */}
          <div className={style.dataGridSection}>
            <h2>All Pitches</h2>
            <div className="ag-theme-alpine-dark" style={{ height: '500px', width: '100%' }}>
              <AgGridReact
                rowData={pitches}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="multiple"
                pagination={true}
                paginationPageSize={20}
              />
            </div>
          </div>
        </>
      ) : (
        <p>{emptyMessage}</p>
      )}

      <SessionNavigation session={sessionId} />
    </Container>
  );
}