"use client"

import React, { useState, useEffect } from 'react'

import PitchSVG from '@/components/PitchTracker/PitchSVG'
import PitchHistory from '@/components/PitchTracker/PitchHistory'

export default function PitchTracker() {
    const [rows, setRows] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/pitch-data')
            .then((r) => r.json())
            .then((data) => setRows(data || []))
    }, [])

    const handleNew = (row: any) => {
        setRows((r) => [row, ...r])
    }

    const handleDeleteLocal = (id: string) => {
        setRows((r) => r.filter((x) => x.id !== id))
    }

    const handleRestore = (row: any) => {
        setRows((r) => [row, ...r])
    }

    return (
        <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 2 }}>
                <PitchSVG onRecord={handleNew} />
            </div>
            <div style={{ flex: 1 }}>
                <PitchHistory rows={rows} onDeleteLocal={handleDeleteLocal} onRestore={handleRestore} />
            </div>
        </div>
    )
}
