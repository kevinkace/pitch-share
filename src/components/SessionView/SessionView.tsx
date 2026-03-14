'use client';

import { Flex } from '@radix-ui/themes';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-theme-alpine.css';

import SessionSummary from '@/components/SessionSummary/SessionSummary';
import SessionStats from '@/components/SessionStats/SessionStats';
import SessionNavigation from '@/components/SessionNavigation/SessionNavigation';
import Container from '@/components/Container/Container';
import SpeedGauge from '@/components/SpeedGauge/SpeedGauge';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';
import { useSession } from '@/lib/contexts/SessionContext';

import { getSpeedColor } from '@/lib/speedRanges';

import style from './SessionView.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface SessionViewProps {
  showOwnershipBadge?: 'profile' | 'public' | 'none'; // Controls what ownership badge to show
  emptyMessage?: string; // Custom message when no pitch data
}

export default function SessionView({
  showOwnershipBadge = 'public',
  emptyMessage = 'No pitch data found for this session.'
}: SessionViewProps) {
  const {
    sessionData,
    pitches,
    loading,
    error,
    sessionId,
    user,
    isOwner,
    sessionMeta,
    pitchSpeeds
  } = useSession();

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
    { field: 'pitch_view', headerName: 'View', width: 120 }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const renderOwnershipBadge = () => {
    if (showOwnershipBadge === 'none') return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {showOwnershipBadge === 'profile' && (
          <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Your Session</span>
        )}
        {showOwnershipBadge === 'public' && isOwner && (
          <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Your Session</span>
        )}
        {showOwnershipBadge === 'public' && !user && (
          <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Public Session</span>
        )}
        {sessionData.is_private && (
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            Private
          </span>
        )}
      </div>
    );
  };

  return (
    <Container>
      <div className={style.topBar}>
        {renderOwnershipBadge()}
        <h1 className={style.header}>
          {sessionMeta.player}
        </h1>

        <div className={style.date}>
          <div>{sessionMeta.date}</div>
          <div>{sessionMeta.startTime}</div>
          <div>{sessionMeta.duration} min</div>
        </div>

        <SessionNavigation session={sessionId} inline={true} />
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