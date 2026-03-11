'use client';

import { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-theme-alpine.css';

import SessionSummary from '@/components/SessionSummary/SessionSummary';
import SessionStats from '@/components/SessionStats/SessionStats';
import SessionNavigation from '@/components/SessionNavigation/SessionNavigation';
import Container from '@/components/Container/Container';
import SpeedGauge from '@/components/SpeedGauge/SpeedGauge';
import SpeedColorIndicator from '@/components/SpeedColorIndicator/SpeedColorIndicator';

import { getSpeedColor } from '@/lib/speedRanges';

import style from './page.module.css';

ModuleRegistry.registerModules([AllCommunityModule]);

interface SessionPageProps {
  params: Promise<{
    userId: string;
    sessionId: string;
  }>;
}

export default function SessionPage({ params }: SessionPageProps) {
    const [sessionData, setSessionData] = useState<any>(null);
    const [pitches, setPitches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        async function loadParams() {
            const resolvedParams = await params;
            setUserId(resolvedParams.userId);
            setSessionId(resolvedParams.sessionId);
        }
        loadParams();
    }, [params]);

    useEffect(() => {
        if (!userId || !sessionId) return;

        async function loadSessionData() {
            const supabase = createClient();

            // Get current user to check permissions
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                notFound();
                return;
            }

            // Fetch session data
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError || !session) {
                notFound();
                return;
            }

            // Check if user has access to this session (owner or public session)
            if (session.user_id !== user.id && session.is_private) {
                notFound();
                return;
            }

            // Fetch pitch data for this session
            const { data: pitchData, error: pitchError } = await supabase
                .from('pitches')
                .select('*')
                .eq('session_id', sessionId)
                .order('count', { ascending: true });

            if (pitchError) {
                console.error('Error fetching pitches:', pitchError);
            }

            setSessionData(session);
            setPitches(pitchData || []);
            setLoading(false);
        }

        loadSessionData();
    }, [userId, sessionId]);

    if (loading) {
        return (
            <Container>
                <p>Loading session...</p>
            </Container>
        );
    }

    if (!sessionData) {
        return (
            <Container>
                <p>Session not found</p>
            </Container>
        );
    }

    const pitchSpeeds = pitches?.map(pitch => pitch.speed).filter(speed => speed !== null) || [];
    const medianSpeed = pitchSpeeds.length > 0 ? calculateMedian(pitchSpeeds) : 0;

    // Calculate session duration (placeholder - you might want to calculate from first/last pitch)
    const duration = pitches?.length ? Math.round(pitches.length * 1.2) : 0; // rough estimate

    const data = {
        meta: {
            player: sessionData.player_name || 'Unknown Player',
            date: sessionData.date ? new Date(sessionData.date).toLocaleDateString() : 'Unknown Date',
            startTime: pitches?.[0]?.time || 'Unknown Start Time',
            duration: duration,
            sport: sessionData.sport || 'Unknown Sport',
            activity: sessionData.activity || 'Unknown Activity',
            unit: sessionData.unit || 'MPH',
            topSpeed: sessionData.fastest_speed || 0,
            avgSpeed: sessionData.average_speed || 0,
            medSpeed: medianSpeed,
            fastestStrike: sessionData.fastest_speed || 0, // You might want to filter only strikes
        },
        session: pitchSpeeds
    };

    // Column definitions for the data grid
    const columnDefs: ColDef[] = [
        { field: 'count', headerName: '#', type: 'numericColumn', width: 80 },
        { field: 'date', width: 120 },
        { field: 'time', width: 100 },
        {
            field: 'speed',
            type: 'numericColumn',
            width: 120,
            cellRenderer: (params: any) => {
                if (!params.value) return '';
                const speed = parseFloat(params.value);
                const unit = sessionData.unit || 'MPH';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SpeedColorIndicator color={getSpeedColor(speed)} />
                        {params.value} {unit}
                    </div>
                );
            }
        },
        { field: 'pitch_type', headerName: 'Type', width: 120 },
        { field: 'pitch_zone', headerName: 'Zone', width: 120 },
        { field: 'pitch_view', headerName: 'View', width: 120 }
    ];

    const defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    };

    return (
        <Container>
            <div className={style.topBar}>
                <h1 className={style.header}>
                    {data.meta.player}
                </h1>

                <div className={style.date}>
                    <div>{data.meta.date}</div>
                    <div>{data.meta.startTime}</div>
                    <div>{data.meta.duration} min</div>
                </div>

                <SessionNavigation session={sessionId} inline={true} />
            </div>

            {pitches && pitches.length > 0 ? (
                <>
                    <SessionSummary
                        pitchCount={sessionData.pitch_count || 0}
                        topSpeed={data.meta.topSpeed}
                        avgSpeed={data.meta.avgSpeed}
                        medSpeed={data.meta.medSpeed}
                        unit={data.meta.unit}
                        fastestStrike={data.meta.fastestStrike}
                    />

                    <Flex className={style.gaugeStats} align="center">
                        <SpeedGauge
                            speed={data.meta.topSpeed}
                            speeds={data.session}
                            unit={data.meta.unit}
                        />
                        <SessionStats
                            speeds={data.session}
                            unit={data.meta.unit}
                        />
                    </Flex>

                    {/* Pitch Data Grid */}
                    <div className={style.dataGridSection}>
                        <h2>All Pitches</h2>
                        <div className="ag-theme-alpine-dark" style={{ height: '500px', width: '100%' }}>
                            <AgGridReact
                                rowData={pitches}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                animateRows={true}
                                rowSelection="multiple"
                                pagination={true}
                                paginationPageSize={20}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <p>No pitch data found for session: {sessionId}</p>
            )}

            <SessionNavigation session={sessionId} />
        </Container>
    );
}

function calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
    }

    return Math.round(sorted[middle]);
}