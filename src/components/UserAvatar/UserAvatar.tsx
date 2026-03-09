import { Avatar } from "@radix-ui/themes";

export default function UserAvatar({ user }: { user: { avatarUrl: string; email: string } }) {
    return <Avatar
        src={user.avatarUrl}
        alt={user.email}
        fallback={user?.email?.[0] || "U"}
        radius="full"
    />;
};