'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef,ModuleRegistry, AllCommunityModule, colorSchemeDark, themeQuartz  } from 'ag-grid-community';
import { getSpeedColor } from '@/lib/speedRanges';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';

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
    { field: 'Count', headerName: '#', type: 'numericColumn' },
    { field: 'Time' },
    {
      field: 'Speed',
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const speed = parseFloat(params.value);
        const unit = data[0]?.Unit || 'MPH';
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SpeedColorIndicator color={getSpeedColor(speed)} />
            {params.value} {unit}
          </div>
        );
      }
    },
    { field: 'Pitch Type', headerName: 'Type' },
    { field: 'Pitch Zone', headerName: 'Zone' },
    { field: 'Pitch View', headerName: 'View' },
    { field: 'Video' }
  ];

  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  const theme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams({
        backgroundColor: 'transparent',
    });

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
        theme={theme}
      />
  );
}