'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { getSpeedColor } from '@/lib/speedRanges';

import styles from './SessionStats.module.css';

interface SessionStatsProps {
    speeds: number[];
    unit: string;
}

export default function SessionStats({ speeds, unit }: SessionStatsProps) {
    const speedCounts: Record<number, number> = {};

    speeds.forEach(speed => {
        speedCounts[speed] = (speedCounts[speed] || 0) + 1;
    });

    // Create continuous range from min to max speed
    const minSpeed = speeds.length > 0 ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
    const chartData = [];

    for (let speed = minSpeed; speed <= maxSpeed; speed++) {
        chartData.push({
            speed,
            count: speedCounts[speed] || 0,
            fill: getSpeedColor(speed)
        });
    }

    return (
        <div className={styles.sessionStats}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="speed"
                        label={{ value: `Speed (${unit})`, position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        formatter={(value) => [value, 'Pitches']}
                        labelFormatter={(label) => `${label} ${unit}`}
                        contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: '#fff'
                        }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
