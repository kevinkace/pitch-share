'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef,ModuleRegistry, AllCommunityModule, colorSchemeDark, themeQuartz  } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);

interface SessionData {
  Time: string;
  Count: string;
  Speed: string;
  Unit: string;
  'Pitch View': string;
  'Pitch Zone': string;
  'Pitch Type': string;
  Video: string;
}

interface SessionDataGridProps {
  data: SessionData[];
}

export default function SessionDataGrid({ data }: SessionDataGridProps) {
  const columnDefs: ColDef<SessionData>[] = [
    { field: 'Count', headerName: '#', width: 70, type: 'numericColumn' },
    { field: 'Time', width: 100 },
    {
      field: 'Speed',
      width: 100,
      type: 'numericColumn',
      cellRenderer: (params: any) => params.value ? `${params.value} ${data[0]?.Unit || 'MPH'}` : ''
    },
    { field: 'Pitch Type', headerName: 'Type', width: 120 },
    { field: 'Pitch Zone', headerName: 'Zone', width: 100 },
    { field: 'Pitch View', headerName: 'View', width: 100 },
    { field: 'Video', width: 80 }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
      <AgGridReact<SessionData>
        domLayout='autoHeight'
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={100}
        suppressCellFocus={true}
        rowSelection="single"
        theme={themeQuartz.withPart(colorSchemeDark)}
      />
  );
}