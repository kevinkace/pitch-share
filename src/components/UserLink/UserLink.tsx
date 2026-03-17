'use client';

import Link, { LinkProps } from "next/link";

import { useAuth } from '@/lib/contexts/AuthContext';

interface UserLinkProps extends Omit<LinkProps, 'href'> {
  userId: string;
  children: React.ReactNode;
}

/**
 * A Link component that automatically routes to the appropriate user page:
 * - /profile for the current user
 * - /users/[userId] for other users
 */
export default function UserLink({ userId, children, ...linkProps }: UserLinkProps) {
  const { user } = useAuth();

  const href = user?.id === userId ? '/profile' : `/users/${userId}`;

  return (
    <Link href={href} {...linkProps}>
      {children}
    </Link>
  );
}