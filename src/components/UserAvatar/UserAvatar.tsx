import { Avatar } from "@radix-ui/themes";
import { User } from '@supabase/supabase-js';

export default function UserAvatar({ profile, ...props }: { user : User }) {
    return <Avatar
        src={profile?.avatar_url}
        alt={profile?.email}
        fallback={profile?.username?.[0] || "U"}
        radius="full"
        {...props}
    />;
};