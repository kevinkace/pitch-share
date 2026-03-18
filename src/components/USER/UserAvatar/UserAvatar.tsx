import { Avatar } from "@radix-ui/themes";
import { UserProfile } from '@/lib/contexts/ProfileContext';

interface UserAvatarProps {
    profile?: UserProfile | null;
    loading?: boolean;
}

export default function UserAvatar({ profile, loading = false, ...props }: UserAvatarProps & Omit<React.ComponentProps<typeof Avatar>, 'src' | 'alt' | 'fallback'>) {
    if (loading) {
        return <Avatar
            src={undefined}
            alt="Loading..."
            fallback="⋯"
            radius="full"
            {...props}
        />;
    }

    return <Avatar
        src={profile?.avatar_url || undefined}
        alt={profile?.username || profile?.full_name || 'User'}
        fallback={profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || "U"}
        radius="full"
        {...props}
    />;
};