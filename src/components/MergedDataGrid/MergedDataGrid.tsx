'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Card, Grid } from '@radix-ui/themes';

import { theme } from '@/lib/datagrid-theme';
import { getSpeedColor } from '@/lib/speedRanges';
import type { MergedPitchData } from '@/lib/mergeData';

import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';

import styles from "./MergedDataGrid.module.css";

const colors = {
  match : "#0099ff30",
  noMatch : "#ff00002c"
}

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
        backgroundColor: params.value ? colors.match : colors.noMatch
      })
    },
    {
      field: 'placementData.y',
      headerName: 'Y Position',
      type: 'numericColumn',
      width: 100,
      valueFormatter: (params) => params.value ? params.value.toFixed(3) : '-',
      cellStyle: (params) => ({
        backgroundColor: params.value ? colors.match : colors.noMatch
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
        if (params.value === undefined || params.value === null) return { backgroundColor: colors.noMatch };
        const value = params.value;
        if (value >= 1 && value <= 5) {
          return { backgroundColor: '#00ff4c1a' };
        } else {
          return { backgroundColor: '#f200ff40' };
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

  const ar = analysisResults ? {
    "Speed Entries"       : analysisResults.totalSpeedEntries,
    "Placement Entries"   : analysisResults.totalPlacementEntries,
    "Matched"             : analysisResults.potentialMatches,
    "Unmatched Speed"     : analysisResults.unmatchedSpeedEntries,
    "Unmatched Placement" : analysisResults.unmatchedPlacementEntries,
    "Avg Delay"           : analysisResults.averageDelay.toFixed(1),
    "Delay Range"         : `${analysisResults.delayRange.min.toFixed(1)}s - ${analysisResults.delayRange.max.toFixed(1)}s`,
    "Match Rate"          : ((analysisResults.potentialMatches / analysisResults.totalSpeedEntries) * 100).toFixed(1) + '%'
  } : {};

  return (
    <div>

      {analysisResults && (
        <Card className={styles.analysisCard}>
          <Grid columns="4" rows="auto" width="auto" gap="3">
            {Object.entries(ar).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </Grid>
        </Card>
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