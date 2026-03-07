"use client"

import { useState, useEffect } from 'react';

interface PitchData {
  id: string;
  x: number;
  y: number;
  strike: boolean;
  ground: boolean;
  timestamp: string;
}

interface PitchPlacementResponse {
  pitches: PitchData[];
  count: number;
  filters: {
    startDate?: string;
    endDate?: string;
    sessionId?: string;
  };
}

interface UsePitchDataOptions {
  startDate?: string;
  endDate?: string;
  sessionId?: string;
  autoFetch?: boolean;
}

/**
 * Hook to fetch pitch placement data
 */
export function usePitchData(options: UsePitchDataOptions = {}) {
  const [data, setData] = useState<PitchPlacementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPitches = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.sessionId) params.append('sessionId', options.sessionId);

      const response = await fetch(`/api/pitch-placement?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchPitches();
    }
  }, [options.startDate, options.endDate, options.sessionId]);

  return {
    pitches: data?.pitches || [],
    count: data?.count || 0,
    filters: data?.filters || {},
    loading,
    error,
    refetch: fetchPitches
  };
}

/**
 * Hook to get today's pitches
 */
export function useTodaysPitches() {
  const today = new Date().toISOString().split('T')[0];
  return usePitchData({ startDate: today });
}

/**
 * Hook to get pitches for a specific date
 */
export function usePitchesForDate(date: string) {
  return usePitchData({ startDate: date, endDate: date });
}