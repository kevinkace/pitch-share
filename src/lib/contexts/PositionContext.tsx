'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { requireUsername } from '@/lib/helpers/requireUsername';

export interface PositionData {
  id?: string;
  user_id?: string;
  session_id?: string | null;
  x: number;
  y: number;
  strike: boolean;
  ground: boolean;
  out_of_bounds: boolean;
  created_at?: string;
}

interface PositionContextType {
  savePosition: (positionData: Omit<PositionData, 'id' | 'user_id' | 'created_at'>) => Promise<PositionData | null>;
  getPositions: (options?: {
    sessionId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<PositionData[]>;
  deletePosition: (positionId: string) => Promise<void>;
  getTodaysPositions: () => Promise<PositionData[]>;
}

const PositionContext = createContext<PositionContextType | undefined>(undefined);

export function PositionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();

  const savePosition = async (positionData: Omit<PositionData, 'id' | 'user_id' | 'created_at'>): Promise<PositionData | null> => {
    if (!user) {
      throw new Error('Must be logged in to save positions');
    }

    const canProceed = requireUsername(() => {});
    if (!canProceed) {
      // Username dialog will be shown, don't proceed
      return null;
    }

    try {
      // Prepare position data
      const insertData: any = {
        user_id: user.id,
        x: positionData.x,
        y: positionData.y,
        strike: positionData.strike,
        ground: positionData.ground,
        out_of_bounds: positionData.out_of_bounds
      };

      // Handle session creation logic
      if (positionData.session_id) {
        insertData.session_id = positionData.session_id;
      } else {
        // Check if user has any positions today to determine if we need a new session
        const today = new Date().toISOString().split('T')[0];
        const { data: todaysPositions } = await supabase
          .from('positions')
          .select('session_id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .lte('created_at', `${today}T23:59:59Z`)
          .not('session_id', 'is', null)
          .limit(1);

        if (todaysPositions && todaysPositions.length > 0) {
          // Use existing session from today
          insertData.session_id = todaysPositions[0].session_id;
        } else {
          // Create new session for today
          const sessionId = `PT_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}_position`;

          // Get user profile for player name
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single();

          const playerName = profile?.username || profile?.full_name || 'Unknown Player';

          // Create session record
          const sessionData = {
            id: sessionId,
            user_id: user.id,
            player_name: playerName,
            date: today,
            sport: 'Baseball',
            activity: 'Pitch Tracker',
            unit: 'MPH',
            pitch_count: 0, // Start with 0, will be incremented after position insert
            strike_count: 0,
            ball_count: 0,
            ground_count: 0,
            out_of_bounds_count: 0,
            is_private: true
          };

          const { error: sessionError } = await supabase
            .from('sessions')
            .insert([sessionData]);

          if (sessionError) {
            console.error('Error creating session:', sessionError);
            throw new Error('Failed to create session');
          }

          insertData.session_id = sessionId;
        }
      }

      // Insert position record
      const { data: position, error: positionError } = await supabase
        .from('positions')
        .insert([insertData])
        .select()
        .single();

      if (positionError) {
        console.error('Error inserting position:', positionError);
        throw new Error('Failed to save position');
      }

      // Update session pitch count and position type counts
      if (insertData.session_id) {
        // Get current session counts
        const { data: currentSession } = await supabase
          .from('sessions')
          .select('pitch_count, strike_count, ball_count, ground_count, out_of_bounds_count')
          .eq('id', insertData.session_id)
          .single();

        const newPitchCount = (currentSession?.pitch_count || 0) + 1;

        // Determine which specific count to increment based on position type
        const updateData: any = {
          pitch_count: newPitchCount,
          updated_at: new Date().toISOString()
        };

        if (positionData.strike) {
          updateData.strike_count = (currentSession?.strike_count || 0) + 1;
        } else if (positionData.ground) {
          updateData.ground_count = (currentSession?.ground_count || 0) + 1;
        } else if (positionData.out_of_bounds) {
          updateData.out_of_bounds_count = (currentSession?.out_of_bounds_count || 0) + 1;
        } else {
          // This is a ball (not strike, not ground, not out of bounds)
          updateData.ball_count = (currentSession?.ball_count || 0) + 1;
        }

        const { error: sessionUpdateError } = await supabase
          .from('sessions')
          .update(updateData)
          .eq('id', insertData.session_id);

        if (sessionUpdateError) {
          console.error('Error updating session counts:', sessionUpdateError);
          // Don't throw here - position was saved successfully, session update is secondary
        }
      }

      return position;
    } catch (error) {
      console.error('Error saving position:', error);
      throw error;
    }
  };

  const getPositions = async (options: {
    sessionId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PositionData[]> => {
    if (!user) {
      throw new Error('Must be logged in to get positions');
    }

    try {
      let query = supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by session if provided
      if (options.sessionId) {
        query = query.eq('session_id', options.sessionId);
      }

      // Filter by date range if provided
      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      const { data: positions, error } = await query;

      if (error) {
        console.error('Error fetching positions:', error);
        throw new Error('Failed to get positions');
      }

      return positions || [];
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  };

  const deletePosition = async (positionId: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to delete positions');
    }

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', positionId)
        .eq('user_id', user.id); // Ensure user can only delete their own positions

      if (error) {
        console.error('Error deleting position:', error);
        throw new Error('Failed to delete position');
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      throw error;
    }
  };

  const getTodaysPositions = async (): Promise<PositionData[]> => {
    const today = new Date().toISOString().split('T')[0];
    return getPositions({ startDate: today, endDate: today });
  };

  return (
    <PositionContext.Provider value={{
      savePosition,
      getPositions,
      deletePosition,
      getTodaysPositions
    }}>
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition() {
  const context = useContext(PositionContext);
  if (context === undefined) {
    throw new Error('usePosition must be used within a PositionProvider');
  }
  return context;
}