import { Avatar } from "@radix-ui/themes";
import { User } from '@supabase/supabase-js';

export default function UserAvatar({ user, ...props }: { user : User }) {
    return <Avatar
        src={user.avatar_url}
        alt={user.email}
        fallback={user?.email?.[0] || "U"}
        radius="full"
        {...props}
    />;
};