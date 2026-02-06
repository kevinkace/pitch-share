import { Metadata } from 'next';

import SessionList from '@/components/SessionList/SessionList';

export const metadata: Metadata = {
  title: 'Pitch Share - Baseball Pitching Analysis & Tracking',
  description: 'Analyze and track baseball pitching sessions with detailed speed statistics, performance metrics, and visual charts. View pitch data, speed gauges, and session summaries.',
  keywords: ['baseball', 'pitching', 'analysis', 'tracking', 'speed', 'statistics', 'sports', 'performance'],
  openGraph: {
    title: 'Pitch Share - Baseball Pitching Analysis',
    description: 'Professional baseball pitching session analysis and tracking platform',
    type: 'website',
  },
};

export default function Home() {
  return (
    <>
      <SessionList />
    </>
  );
}
