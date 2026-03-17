"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { requireUsername } from '@/lib/helpers/requireUsername';

/**
 * Hook for pitch operations that require username
 */
export function usePitchOperations() {
    const { user } = useAuth();
    const supabase = createClient();

    const savePitch = async (pitchData: {
        session_id: string;
        count?: number;
        date?: string;
        time?: string;
        speed?: number;
        unit?: string;
        pitch_view?: string;
        pitch_zone?: string;
        pitch_type?: string;
        player_name?: string;
        sport?: string;
        activity?: string;
        video?: string;
    }) => {
        if (!user) {
            throw new Error('Must be logged in to save pitches');
        }

        const canProceed = requireUsername(() => {});
        if (!canProceed) {
            // Username dialog will be shown, don't proceed
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('pitches')
                .insert({
                    user_id: user.id,
                    ...pitchData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error saving pitch:', error);
            throw new Error(error.message || 'Failed to save pitch');
        }
    };

    const createSession = async (sessionData: {
        id: string;
        player_name: string;
        date?: string;
        sport?: string;
        activity?: string;
        unit?: string;
        is_private?: boolean;
    }) => {
        if (!user) {
            throw new Error('Must be logged in to create sessions');
        }

        const canProceed = requireUsername(() => {});
        if (!canProceed) {
            // Username dialog will be shown, don't proceed
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert({
                    user_id: user.id,
                    ...sessionData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error creating session:', error);
            throw new Error(error.message || 'Failed to create session');
        }
    };

    return {
        savePitch,
        createSession
    };
}