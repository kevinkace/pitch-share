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
import UserAvatar from "@/components/UserAvatar/UserAvatar";

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
    { field: 'count', headerName: '#', type: 'numericColumn', width: 80, flex: 0 },
    {
      field: 'time',
      minWidth: 100,
      flex: 1,
      cellRenderer: (params: { value: string }) => {
        if (!params.value) return '';
        // Format time as 12-hour format without seconds
        const time = new Date(`2000-01-01 ${params.value}`);
        if (isNaN(time.getTime())) {
          return params.value; // Return original if parsing fails
        }
        return time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    },
    {
      field: 'speed',
      type: 'numericColumn',
      minWidth: 120,
      flex: 1,
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
    { field: 'pitch_type', headerName: 'Type', minWidth: 120, flex: 1 },
    { field: 'pitch_zone', headerName: 'Zone', minWidth: 120, flex: 1 },
    { field: 'pitch_view', headerName: 'View', minWidth: 120, flex: 1 },
    // Conditionally add actions column for session owners
    ...(isOwner ? [{
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      flex: 0,
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
    flex: 1,
  };

  return (
    <Container>
      <div className={style.topBar}>
          <Flex gap="4" align="center">
            <UserAvatar user={sessionMeta.player} size="5"/>
            <div>
              <Flex gap="4" align="center">
                <h1 className={style.header}>
                  {sessionMeta.player}
                </h1>
                <SessionOwnershipBadge />
              </Flex>

              <div className={style.date}>
                <div>{sessionMeta.date}</div> &middot;
                <div>{sessionMeta.startTime}</div> &middot;
                <div>{sessionMeta.duration} min</div>
              </div>
            </div>
          </Flex>

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
            <div className="ag-theme-alpine-dark" style={{ width: '100%' }}>
              <AgGridReact
                rowData={pitches}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="multiple"
                domLayout="autoHeight"
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