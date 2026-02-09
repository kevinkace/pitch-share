"use client"

import React, { useCallback, useRef } from 'react'

import { AgGridReact } from 'ag-grid-react'
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

import { theme } from '@/lib/datagrid-theme'

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
        {
            field: 'timestamp', headerName: 'Time', width: 90,
            valueGetter: (params: any) => params.data?.timestamp ?? params.data?.Time ?? params.data?.time ?? '',
            valueFormatter: (params: any) => {
                const v = params.value
                if (!v) return ''
                try {
                    const d = new Date(v)
                    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                } catch { return String(v) }
            }
        },
        { field: 'x', headerName: 'X (ft)', width: 70 },
        { field: 'y', headerName: 'Y (ft)', width: 70 },
        { field: 'strike', headerName: 'S', width: 40 },
        { field: 'ground', headerName: 'G', width: 40 },
        {
            headerName: 'Actions', width: 64, cellRenderer: (params: any) => {
                return React.createElement('button', {
                    onClick: () => deleteRow(params.data),
                    title: 'Delete',
                    style: { cursor: 'pointer', background: 'transparent', border: 'none', padding: 4 }
                }, '🗑️')
            }
        }
    ]

    const defaultColDef: ColDef = {
        sortable: false,
        filter: false,
        resizable: true,
    }

    return (
        <div style={{ flex: 1 }}>
            <div style={{ height: 600, width: '100%' }}>
                <AgGridReact<PitchRow>
                    ref={gridRef}
                    domLayout="autoHeight"
                    rowData={rows}
                    columnDefs={cols}
                    defaultColDef={defaultColDef}
                    pagination={false}
                    suppressCellFocus={true}
                    rowSelection="single"
                    theme={theme}
                />
            </div>
        </div>
    )
}
