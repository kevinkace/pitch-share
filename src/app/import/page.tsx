'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@radix-ui/themes";
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import Container from '@/components/Container/Container';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';

import { useImport } from '@/lib/contexts/ImportContext';
import { getSpeedColor } from '@/lib/speedRanges';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';

import styles from './page.module.css';ModuleRegistry.registerModules([AllCommunityModule]);

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

export default function ImportPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { csvData, fileName, clearImportData } = useImport();

    const [sessionTitle, setSessionTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // If no data, redirect back to home
    if (!csvData || csvData.length === 0) {
        router.push('/');
        return null;
    }

    const columnDefs: ColDef<SessionData>[] = [
        { field: 'Count', headerName: '#', type: 'numericColumn', width: 80 },
        { field: 'Date', width: 120 },
        { field: 'Time', width: 100 },
        {
        field: 'Speed',
        type: 'numericColumn',
        width: 120,
        cellRenderer: (params: any) => {
            if (!params.value) return '';
            const speed = parseFloat(params.value);
            const unit = csvData[0]?.Unit || 'MPH';
            return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SpeedColorIndicator color={getSpeedColor(speed)} />
                {params.value} {unit}
            </div>
            );
        }
        },
        { field: 'Pitch Type', headerName: 'Type', width: 120 },
        { field: 'Pitch Zone', headerName: 'Zone', width: 120 },
        { field: 'Pitch View', headerName: 'View', width: 120 },
        { field: 'Player Name', headerName: 'Player', width: 150 },
        { field: 'Sport', width: 100 },
        { field: 'Activity', width: 150 },
        { field: 'Video', width: 80 }
    ];

    const defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    };

    const handleSaveSession = async () => {
        if (!user) {
           alert('You must be logged in to save sessions');
            return;
        }

        if (!sessionTitle.trim()) {
            alert('Please enter a session title');
            return;
        }

        setIsSaving(true);

        try {
            const supabase = createClient();

            // Generate session ID from current timestamp
            const now = new Date();
            const sessionId = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}_${Math.floor(Math.random() * 1000)}`;

            // Prepare session metadata
            const sessionMeta = {
                id: sessionId,
                user_id: user.id,
                title: sessionTitle,
                player_name: csvData[0]?.['Player Name'] || 'Unknown',
                date: csvData[0]?.Date,
                sport: csvData[0]?.Sport || 'Baseball',
                activity: csvData[0]?.Activity || 'Pitching',
                unit: csvData[0]?.Unit || 'MPH',
                pitch_count: csvData.length,
                raw_data: csvData
            };

            // Save to Supabase - RLS policies handle user permissions
            const { error } = await supabase
                .from('sessions')
                .insert([sessionMeta]);

            if (error) {
                throw error;
            }

            // Clear import data and redirect to the new session
            clearImportData();
            alert('Session saved successfully!');
            router.push(`/${sessionId}`);

        } catch (error) {
            console.error('Error saving session:', error);
            alert('Error saving session. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const sessionSummary = useMemo(() => {
        const speeds = csvData.map(row => parseFloat(row.Speed)).filter(speed => !isNaN(speed));
        const topSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
        const avgSpeed = speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;

        return {
            pitchCount: csvData.length,
            topSpeed,
            avgSpeed,
            playerName: csvData[0]?.['Player Name'] || 'Unknown player',
            date: csvData[0]?.Date,
            unit: csvData[0]?.Unit || 'MPH'
        };
    }, [csvData]);

    return (
        <Container>
        <div className={styles.container}>
            <div className={styles.header}>
            <div>
                <h1 className={styles.title}>Import Session</h1>
                <p className={styles.subtitle}>
                {fileName} • {sessionSummary.pitchCount} pitches • {sessionSummary.playerName}
                </p>
            </div>

            <div className={styles.actions}>
                <Button
                variant="soft"
                onClick={() => {
                    clearImportData();
                    router.push('/');
                }}
                >
                Cancel
                </Button>
            </div>
            </div>

            <div className={styles.sessionForm}>
            <label htmlFor="sessionTitle" className={styles.label}>
                Session Title *
            </label>
            <input
                id="sessionTitle"
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title..."
                className={styles.input}
            />
            </div>

            <div className={styles.summary}>
            <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Date:</span>
                <span>{sessionSummary.date}</span>
            </div>
            <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Player:</span>
                <span>{sessionSummary.playerName}</span>
            </div>
            <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pitches:</span>
                <span>{sessionSummary.pitchCount}</span>
            </div>
            <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Top Speed:</span>
                <span>{sessionSummary.topSpeed} {sessionSummary.unit}</span>
            </div>
            <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Avg Speed:</span>
                <span>{sessionSummary.avgSpeed} {sessionSummary.unit}</span>
            </div>
            </div>

            <div className={styles.dataGrid}>
            <div className="ag-theme-alpine-dark" style={{ height: '500px', width: '100%' }}>
                <AgGridReact
                rowData={csvData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="multiple"
                pagination={true}
                paginationPageSize={20}
                />
            </div>
            </div>

            <div className={styles.saveSection}>
            <Button
                onClick={handleSaveSession}
                disabled={isSaving || !sessionTitle.trim()}
                size="3"
            >
                {isSaving ? 'Saving Session...' : 'Save Session'}
            </Button>
            </div>
        </div>
        </Container>
    );
}