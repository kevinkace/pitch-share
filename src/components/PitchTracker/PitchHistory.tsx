"use client"

import React, { useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

type Props = {
    rows: any[]
    onDeleteLocal: (id: string) => void
    onRestore: (row: any) => void
}

export default function PitchHistory({ rows, onDeleteLocal, onRestore }: Props) {
    const gridRef = useRef<any>(null)

    const deleteRow = useCallback((row: any) => {
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

    const cols = [
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

    return (
        <div style={{ flex: 1 }}>
            <div className="ag-theme-alpine" style={{ height: 600, width: 600 }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rows}
                    columnDefs={cols}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                />
            </div>
        </div>
    )
}
