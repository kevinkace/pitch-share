"use client";

import React, { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule, GridApi } from 'ag-grid-community';

import { theme } from '@/lib/datagrid-theme';
import { PositionData } from '@/lib/contexts/PositionContext';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  positions: PositionData[]; // All positions to display
}

export default function PositionsGrid({ positions }: Props) {

  // Generate unique ID for each row so ag-grid can track them
  const getRowId = (params: any) => {
    const data = params.data;
    return data.id || `temp-${data.created_at}-${data.x}-${data.y}`;
  };

  const columnDefs: ColDef<PositionData>[] = [
    {
      field: 'created_at',
      headerName: 'Time',
      width: 90,
      valueFormatter: (params) => {
        if (!params.value) return '';
        try {
          const date = new Date(params.value);
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        } catch {
          return String(params.value);
        }
      }
    },
    {
      field: 'x',
      headerName: 'X (ft)',
      width: 70,
      valueFormatter: (params) => params.value?.toFixed(1) || '0.0'
    },
    {
      field: 'y',
      headerName: 'Y (ft)',
      width: 70,
      valueFormatter: (params) => params.value?.toFixed(1) || '0.0'
    },
    {
      field: 'strike',
      headerName: 'Strike',
      width: 60,
      cellRenderer: (params: any) => params.value ? '✓' : ''
    },
    {
      field: 'ground',
      headerName: 'Ground',
      width: 60,
      cellRenderer: (params: any) => params.value ? '✓' : ''
    },
    {
      field: 'out_of_bounds',
      headerName: 'OOB',
      width: 50,
      cellRenderer: (params: any) => params.value ? '✓' : ''
    },
    {
      headerName: 'Zone',
      width: 80,
      valueGetter: (params) => {
        const row = params.data;
        if (!row) return '';
        if (row.strike) return 'Strike';
        if (row.ground) return 'Ground';
        if (row.out_of_bounds) return 'Out';
        return 'Ball';
      }
    }
  ];

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
        Position History ({positions.length})
      </h3>

      <AgGridReact
        domLayout='autoHeight'
        columnDefs={columnDefs}
        rowData={positions}
        getRowId={getRowId}
        suppressRowClickSelection={true}
        animateRows={true}
        defaultColDef={{
          sortable: true,
          resizable: true,
          suppressMovable: true,
          flex: 1
        }}
        pagination={true}
        paginationPageSize={50}
        suppressCellFocus={true}
        theme={theme}
      />
    </div>
  );
}