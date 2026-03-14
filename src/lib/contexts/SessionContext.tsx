'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface Session {
  id: string;
  user_id: string;
  player_name: string;
  date: string;
  sport: string;
  activity: string;
  unit: string;
  pitch_count?: number;
  fastest_speed?: number;
  average_speed?: number;
  is_private: boolean;
}

interface Pitch {
  id: string;
  session_id: string;
  count: number;
  speed: number | null;
  date: string;
  time: string;
  pitch_type?: string;
  pitch_zone?: string;
  pitch_view?: string;
}

interface SessionContextType {
  sessionData: Session | null;
  pitches: Pitch[];
  loading: boolean;
  error: string | null;
  sessionId: string;
  userId?: string;
  user: User | null;
  isOwner: boolean;
  pitchSpeeds: number[];
  medianSpeed: number;
  togglePrivacy: () => Promise<void>;
  deletePitch: (pitchId: string) => Promise<void>;
  sessionMeta: {
    player: string;
    date: string;
    startTime: string;
    duration: number;
    sport: string;
    activity: string;
    unit: string;
    topSpeed: number;
    avgSpeed: number;
    medSpeed: number;
    fastestStrike: number;
  };
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  sessionId: string;
  userId?: string; // For public route - if provided, allows public access
  requireAuth?: boolean; // If true, redirects to login when not authenticated
}

export function SessionProvider({ children, sessionId, userId, requireAuth = false }: SessionProviderProps) {
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadSessionData() {
      try {
        const supabase = createClient();

        // Get current user
        let { data: { user: currentUser } } = await supabase.auth.getUser();

        // If no user, try refreshing the session first
        if (!currentUser) {
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

            if (!refreshError && refreshData.session && refreshData.user) {
              currentUser = refreshData.user;
            }
          } catch (refreshError) {
            console.error('Session refresh failed:', refreshError);
          }
        }

        // If requireAuth is true and still no user, redirect to login
        if (requireAuth && !currentUser) {
          redirect('/login');
          return;
        }

        setUser(currentUser);

        // Fetch session data
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          setError('Session not found');
          notFound();
          return;
        }

        // Check permissions based on route type
        let hasAccess = false;

        if (userId) {
          // Public route: check if user matches URL param and session access rules
          if (session.user_id !== userId) {
            setError('Session does not belong to specified user');
            notFound();
            return;
          }

          // Allow access if: user owns the session OR session is public
          hasAccess =
            (currentUser && session.user_id === currentUser.id) ||  // User owns the session
            !session.is_private;                                     // Session is public
        } else {
          // Profile route: user must own the session
          if (!currentUser || session.user_id !== currentUser.id) {
            setError('Access denied');
            notFound();
            return;
          }
          hasAccess = true;
        }

        if (!hasAccess) {
          setError('Access denied');
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
          setError('Error loading pitch data');
        }

        setSessionData(session);
        setPitches(pitchData || []);
      } catch (err) {
        console.error('Error loading session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId, userId, requireAuth]);

  // Calculate derived data
  const pitchSpeeds = pitches?.map(pitch => pitch.speed).filter(speed => speed !== null) as number[] || [];
  const medianSpeed = pitchSpeeds.length > 0 ? calculateMedian(pitchSpeeds) : 0;
  const isOwner = user ? sessionData?.user_id === user.id : false;

  // Function to toggle session privacy
  const togglePrivacy = async (): Promise<void> => {
    if (!isOwner || !sessionData) {
      throw new Error('Only session owners can change privacy settings');
    }

    try {
      const supabase = createClient();
      const newPrivacyState = !sessionData.is_private;

      const { error } = await supabase
        .from('sessions')
        .update({ is_private: newPrivacyState })
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Failed to update session privacy: ${error.message}`);
      }

      // Update local state
      setSessionData(prevData =>
        prevData ? { ...prevData, is_private: newPrivacyState } : null
      );
    } catch (error) {
      console.error('Error toggling session privacy:', error);
      throw error;
    }
  };

  // Function to delete a pitch
  const deletePitch = async (pitchId: string): Promise<void> => {
    if (!isOwner) {
      throw new Error('You can only delete pitches from your own sessions.');
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('pitches')
        .delete()
        .eq('id', pitchId)
        .eq('session_id', sessionId); // Extra safety check

      if (error) {
        throw new Error(`Failed to delete pitch: ${error.message}`);
      }

      // Update local state by removing the deleted pitch
      setPitches(prevPitches => prevPitches.filter(pitch => pitch.id !== pitchId));

      // Update session data pitch count if it exists
      if (sessionData?.pitch_count) {
        setSessionData(prevData =>
          prevData ? { ...prevData, pitch_count: prevData.pitch_count! - 1 } : null
        );
      }
    } catch (error) {
      console.error('Error deleting pitch:', error);
      throw error;
    }
  };

  // Calculate session duration (placeholder - you might want to calculate from first/last pitch)
  const duration = pitches?.length ? Math.round(pitches.length * 1.2) : 0;

  const sessionMeta = {
    player: sessionData?.player_name || 'Unknown Player',
    date: sessionData?.date ? new Date(sessionData.date).toLocaleDateString() : 'Unknown Date',
    startTime: pitches?.[0]?.time || 'Unknown Start Time',
    duration: duration,
    sport: sessionData?.sport || 'Unknown Sport',
    activity: sessionData?.activity || 'Unknown Activity',
    unit: sessionData?.unit || 'MPH',
    topSpeed: sessionData?.fastest_speed || 0,
    avgSpeed: sessionData?.average_speed || 0,
    medSpeed: medianSpeed,
    fastestStrike: sessionData?.fastest_speed || 0, // You might want to filter only strikes
  };

  const contextValue: SessionContextType = {
    sessionData,
    pitches,
    loading,
    error,
    sessionId,
    userId,
    user,
    isOwner,
    pitchSpeeds,
    medianSpeed,
    togglePrivacy,
    deletePitch,
    sessionMeta,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

function calculateMedian(numbers: number[]): number {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return Math.round(sorted[middle]);
}