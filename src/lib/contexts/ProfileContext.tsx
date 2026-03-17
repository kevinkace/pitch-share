'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { UsernameCreation } from '@/components/UsernameCreation/UsernameCreation';

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

type ProfileContextType = {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    hasProfile: boolean;
    hasUsername: boolean;
    createProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile | undefined>;
    updateUsername: (username: string) => Promise<UserProfile | undefined>;
    canChangeUsername: () => boolean;
    daysUntilUsernameChange: () => number;
    refetch: () => void;
    refreshProfile: () => void;
    // Username requirement functionality
    showUsernameDialog: boolean;
    isUsernameRequired: boolean;
    requireUsernameForAction: (action: () => void) => boolean;
    handleUsernameSuccess: (username: string) => void;
    handleDialogClose: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Username dialog state
    const [showUsernameDialog, setShowUsernameDialog] = useState(false);
    const [isUsernameRequired, setIsUsernameRequired] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const supabase = createClient();

    const fetchProfile = async (userId: string) => {
        // Don't show loading if we already have a profile
        const shouldShowLoading = !profile;

        try {
            if (shouldShowLoading) {
                setLoading(true);
            }
            setError(null);

            console.log('Fetching profile for userId:', userId);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId);

            console.log('Profile query result:', { data, error });

            if (error) {
                console.error('Profile query error:', error);
                if (error.code === 'PGRST301' || error.message.includes('406')) {
                    console.error('Possible RLS or table access issue');
                }
                throw error;
            }

            if (!data || data.length === 0) {
                console.log('No profile found for user, creating one automatically');
                try {
                    const newProfile = await createProfile({});
                    setProfile(newProfile || null);
                } catch (createError) {
                    console.error('Failed to auto-create profile:', createError);
                    setProfile(null);
                }
            } else {
                setProfile(data[0]);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setError(error.message || 'Failed to fetch profile');
        } finally {
            if (shouldShowLoading) {
                setLoading(false);
            }
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

    // Reset profile state when user signs out
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setError(null);
        }
    }, [user]);

    // Check if we should show the username creation dialog on load
    useEffect(() => {
        if (!loading && profile && !profile.username) {
            // User has a profile but no username - show dialog as optional initially
            setShowUsernameDialog(true);
            setIsUsernameRequired(false);
        }
    }, [loading, profile]);

    // Username requirement functions
    const requireUsernameForAction = (action: () => void) => {
        if (profile?.username) {
            // Username exists, proceed with action
            action();
            return true;
        }

        // Username required, show dialog and store pending action
        setPendingAction(() => action);
        setIsUsernameRequired(true);
        setShowUsernameDialog(true);
        return false;
    };

    const handleUsernameSuccess = (username: string) => {
        setShowUsernameDialog(false);
        setIsUsernameRequired(false);

        // Execute pending action if any
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleDialogClose = () => {
        if (!isUsernameRequired) {
            setShowUsernameDialog(false);
            setPendingAction(null);
        }
    };

    // Make requireUsernameForAction available globally
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).requireUsernameForAction = requireUsernameForAction;
        }
    }, [requireUsernameForAction]);

    const refetch = () => user?.id && fetchProfile(user.id);
    const refreshProfile = refetch;

    return (
        <ProfileContext.Provider value={{
            profile,
            loading: loading || authLoading,
            error,
            hasProfile: !!profile,
            hasUsername: !!profile?.username,
            createProfile,
            updateUsername,
            canChangeUsername,
            daysUntilUsernameChange,
            refetch,
            refreshProfile,
            showUsernameDialog,
            isUsernameRequired,
            requireUsernameForAction,
            handleUsernameSuccess,
            handleDialogClose
        }}>
            {children}

            {/* Username creation dialog */}
            <UsernameCreation
                open={showUsernameDialog}
                onClose={handleDialogClose}
                onSuccess={handleUsernameSuccess}
                required={isUsernameRequired}
            />
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}