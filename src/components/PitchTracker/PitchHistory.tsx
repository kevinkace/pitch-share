"use client"

import React, { useCallback, useRef } from 'react'

import { AgGridReact } from 'ag-grid-react'
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllCommunityModule])

type PitchRow = {
    id: string
    x: number
    y: number
    strike: boolean
    ground: boolean
    timestamp: string
}

type Props = {
    rows: PitchRow[]
    onDeleteLocal: (id: string) => void
    onRestore: (row: PitchRow) => void
}

export default function PitchHistory({ rows, onDeleteLocal, onRestore }: Props) {
    const gridRef = useRef<any>(null)

    const deleteRow = useCallback((row: PitchRow) => {
        // optimistic remove and allow undo
        onDeleteLocal(row.id)

        fetch('/api/pitch-data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id }) })

        // show simple undo via confirm for now
        const undo = confirm('Deleted. Click OK to undo (re-add).')
        if (undo) {
            fetch('/api/pitch-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) })
                .then((r) => r.json())
                .then((restored) => onRestore(restored))
        }
    }, [onDeleteLocal, onRestore])

    const cols: ColDef<PitchRow>[] = [
        { field: 'timestamp', headerName: 'Time', flex: 1 },
        { field: 'x', headerName: 'X (ft)' },
        { field: 'y', headerName: 'Y (ft)' },
        { field: 'strike', headerName: 'Strike' },
        { field: 'ground', headerName: 'Ground' },
        {
            headerName: 'Actions', cellRenderer: (params: any) => {
                return React.createElement('button', { onClick: () => deleteRow(params.data) }, 'Delete')
            }
        }
    ]

    const defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }

    return (
        <div style={{ flex: 1 }}>
            <div className="ag-theme-alpine" style={{ height: 600, width: 600 }}>
                <AgGridReact<PitchRow>
                    ref={gridRef}
                    domLayout="autoHeight"
                    rowData={rows}
                    columnDefs={cols}
                    defaultColDef={defaultColDef}
                    pagination={false}
                    suppressCellFocus={true}
                    rowSelection="single"
                />
            </div>
        </div>
    )
}
