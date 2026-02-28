'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { theme } from '@/lib/datagrid-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

interface PlacementData {
  id: string;
  x: number;
  y: number;
  strike: boolean;
  ground: boolean;
  timestamp: string;
}

interface PlacementDataGridProps {
  data: PlacementData[];
}

export default function PlacementDataGrid({ data }: PlacementDataGridProps) {
  const columnDefs: ColDef<PlacementData>[] = [
    {
      field: 'id',
      headerName: 'Pitch ID',
      flex: 2,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return params.value.substring(0, 8) + '...';
      }
    },
    {
      field: 'x',
      headerName: 'X Position',
      type: 'numericColumn',
      valueFormatter: (params) => params.value ? params.value.toFixed(3) : ''
    },
    {
      field: 'y',
      headerName: 'Y Position',
      type: 'numericColumn',
      valueFormatter: (params) => params.value ? params.value.toFixed(3) : ''
    },
    {
      field: 'strike',
      headerName: 'Strike',
      cellRenderer: (params: any) => {
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
      field: 'ground',
      headerName: 'Ground Ball',
      cellRenderer: (params: any) => {
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
      field: 'timestamp',
      headerName: 'Time',
      valueFormatter: (params) => {
        if (!params.value) return '';
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
      <h3 style={{ marginBottom: '10px' }}>Pitch Placement Data</h3>
      <AgGridReact<PlacementData>
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