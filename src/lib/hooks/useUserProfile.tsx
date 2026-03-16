"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

export interface UserProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    username_updated_at: string | null;
    created_at: string;
    updated_at: string;
}

export function useUserProfile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching profile for userId:', userId);

            // First try to get the profile without .single() to avoid 406 errors
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId);

            console.log('Profile query result:', { data, error });

            // Handle different response scenarios
            if (error) {
                console.error('Profile query error:', error);
                if (error.code === 'PGRST301' || error.message.includes('406')) {
                    // Likely RLS policy issue or table access issue
                    console.error('Possible RLS or table access issue');
                }
                throw error;
            }

            if (!data || data.length === 0) {
                // No profile exists yet - this is normal for new users
                console.log('No profile found for user, will need to create one');
                setProfile(null);
            } else {
                // Profile exists
                setProfile(data[0]);
            }

            if (!data || data.length === 0) {
                // No profile exists yet - this is normal for new users
                console.log('No profile found for user, will need to create one');
                setProfile(null);
            } else {
                // Profile exists
                setProfile(data[0]);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setError(error.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const createProfile = async (profileData: Partial<UserProfile>) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return data;
        } catch (error: any) {
            console.error('Error creating/updating profile:', error);
            setError(error.message || 'Failed to create profile');
            throw error;
        }
    };

    const updateUsername = async (username: string) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: username.toLowerCase(),
                    username_updated_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return data;
        } catch (error: any) {
            console.error('Error updating username:', error);
            if (error.code === '23505') {
                throw new Error('This username is already taken');
            }
            throw new Error('Failed to update username');
        }
    };

    const canChangeUsername = () => {
        if (!profile?.username_updated_at) return true;

        const lastUpdate = new Date(profile.username_updated_at);
        const now = new Date();
        const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceUpdate >= 60;
    };

    const daysUntilUsernameChange = () => {
        if (!profile?.username_updated_at) return 0;

        const lastUpdate = new Date(profile.username_updated_at);
        const now = new Date();
        const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

        return Math.max(0, 60 - Math.floor(daysSinceUpdate));
    };

    // Fetch profile when user changes
    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id);
        } else if (!authLoading) {
            setProfile(null);
            setLoading(false);
        }
    }, [user?.id, authLoading]);

    return {
        profile,
        loading: loading || authLoading,
        error,
        hasProfile: !!profile,
        hasUsername: !!profile?.username,
        createProfile,
        updateUsername,
        canChangeUsername,
        daysUntilUsernameChange,
        refetch: () => user?.id && fetchProfile(user.id)
    };
}