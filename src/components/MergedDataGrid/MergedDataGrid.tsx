'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { theme } from '@/lib/datagrid-theme';
import { getSpeedColor } from '@/lib/speedRanges';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';
import type { MergedPitchData } from '@/lib/mergeData';

ModuleRegistry.registerModules([AllCommunityModule]);

interface MergedDataGridProps {
  data: MergedPitchData[];
  analysisResults?: {
    totalSpeedEntries: number;
    totalPlacementEntries: number;
    potentialMatches: number;
    averageDelay: number;
    delayRange: { min: number; max: number };
    unmatchedSpeedEntries: number;
    unmatchedPlacementEntries: number;
  };
}

export default function MergedDataGrid({ data, analysisResults }: MergedDataGridProps) {
  const columnDefs: ColDef<MergedPitchData>[] = [
    {
      field: 'sessionData.Count',
      headerName: 'Pitch #',
      type: 'numericColumn',
      width: 80
    },
    {
      field: 'sessionData.Time',
      headerName: 'Speed Time',
      width: 120
    },
    {
      field: 'sessionData.Speed',
      headerName: 'Speed',
      type: 'numericColumn',
      width: 100,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const speed = parseFloat(params.value);
        const unit = params.data?.sessionData?.Unit || 'MPH';
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SpeedColorIndicator color={getSpeedColor(speed)} />
            {params.value} {unit}
          </div>
        );
      }
    },
    {
      field: 'sessionData.Pitch Type',
      headerName: 'Type',
      width: 100
    },
    {
      field: 'placementData.x',
      headerName: 'X Position',
      type: 'numericColumn',
      width: 100,
      valueFormatter: (params) => params.value ? params.value.toFixed(3) : '-',
      cellStyle: (params) => ({
        backgroundColor: params.value ? '#f0f9ff' : '#fef2f2'
      })
    },
    {
      field: 'placementData.y',
      headerName: 'Y Position',
      type: 'numericColumn',
      width: 100,
      valueFormatter: (params) => params.value ? params.value.toFixed(3) : '-',
      cellStyle: (params) => ({
        backgroundColor: params.value ? '#f0f9ff' : '#fef2f2'
      })
    },
    {
      field: 'placementData.strike',
      headerName: 'Strike',
      width: 80,
      cellRenderer: (params: any) => {
        if (params.value === undefined || params.value === null) return '-';
        return (
          <span style={{
            color: params.value ? '#22c55e' : '#ef4444',
            fontWeight: 'bold'
          }}>
            {params.value ? 'Yes' : 'No'}
          </span>
        );
      }
    },
    {
      field: 'timeDifference',
      headerName: 'Time Diff (s)',
      type: 'numericColumn',
      width: 120,
      valueFormatter: (params) => {
        if (params.value === undefined || params.value === null) return '-';
        return `${params.value.toFixed(1)}s`;
      },
      cellStyle: (params) => {
        if (params.value === undefined || params.value === null) return { backgroundColor: '#fef2f2' };
        const value = params.value;
        if (value >= 1 && value <= 5) {
          return { backgroundColor: '#f0fdf4', color: '#166534' };
        } else {
          return { backgroundColor: '#fef3c7', color: '#92400e' };
        }
      }
    },
    {
      field: 'placementData.timestamp',
      headerName: 'Placement Time',
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleTimeString();
      }
    }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Merged Speed & Placement Data</h3>

      {analysisResults && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Analysis Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong>Speed Entries:</strong> {analysisResults.totalSpeedEntries}
            </div>
            <div>
              <strong>Placement Entries:</strong> {analysisResults.totalPlacementEntries}
            </div>
            <div style={{ color: '#22c55e' }}>
              <strong>Matched:</strong> {analysisResults.potentialMatches}
            </div>
            <div style={{ color: '#ef4444' }}>
              <strong>Unmatched Speed:</strong> {analysisResults.unmatchedSpeedEntries}
            </div>
            <div style={{ color: '#ef4444' }}>
              <strong>Unmatched Placement:</strong> {analysisResults.unmatchedPlacementEntries}
            </div>
            <div>
              <strong>Avg Delay:</strong> {analysisResults.averageDelay.toFixed(1)}s
            </div>
            <div>
              <strong>Delay Range:</strong> {analysisResults.delayRange.min.toFixed(1)}s - {analysisResults.delayRange.max.toFixed(1)}s
            </div>
            <div>
              <strong>Match Rate:</strong> {((analysisResults.potentialMatches / analysisResults.totalSpeedEntries) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <AgGridReact<MergedPitchData>
        domLayout='autoHeight'
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={50}
        suppressCellFocus={true}
        rowSelection="single"
        theme={theme}
      />
    </div>
  );
}