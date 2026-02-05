'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef,ModuleRegistry, AllCommunityModule } from 'ag-grid-community';


ModuleRegistry.registerModules([ AllCommunityModule ]);

interface SessionData {
  Date: string;
  Time: string;
  'Session Title': string;
  Count: string;
  Speed: string;
  Unit: string;
  'Pitch View': string;
  'Pitch Zone': string;
  'Pitch Type': string;
  'Player Name': string;
  Sport: string;
  Activity: string;
  Video: string;
}

interface SessionDataGridProps {
  data: SessionData[];
}

export default function SessionDataGrid({ data }: SessionDataGridProps) {
  const columnDefs: ColDef<SessionData>[] = [
    { field: 'Count', headerName: '#', width: 70, type: 'numericColumn' },
    { field: 'Date', width: 100 },
    { field: 'Time', width: 100 },
    {
      field: 'Speed',
      width: 80,
      type: 'numericColumn',
      cellRenderer: (params: any) => params.value ? `${params.value} ${data[0]?.Unit || 'MPH'}` : ''
    },
    { field: 'Pitch Type', headerName: 'Type', width: 120 },
    { field: 'Pitch Zone', headerName: 'Zone', width: 100 },
    { field: 'Pitch View', headerName: 'View', width: 100 },
    { field: 'Player Name', headerName: 'Player', width: 150 },
    { field: 'Sport', width: 100 },
    { field: 'Activity', width: 150 },
    { field: 'Session Title', headerName: 'Title', width: 200 },
    { field: 'Video', width: 80 }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
      <AgGridReact<SessionData>
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        suppressCellFocus={true}
        rowSelection="single"
      />
    </div>
  );
}