import { Avatar } from "@radix-ui/themes";
import { UserProfile } from '@/lib/hooks/useUserProfile';

interface UserAvatarProps {
    profile?: UserProfile | null;
}

export default function UserAvatar({ profile, ...props }: UserAvatarProps & Omit<React.ComponentProps<typeof Avatar>, 'src' | 'alt' | 'fallback'>) {
    return <Avatar
        src={profile?.avatar_url || undefined}
        alt={profile?.username || profile?.full_name || 'User'}
        fallback={profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || "U"}
        radius="full"
        {...props}
    />;
};