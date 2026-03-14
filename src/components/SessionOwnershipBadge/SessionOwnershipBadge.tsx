'use client';

import { useState } from 'react';
import { Button } from '@radix-ui/themes';

import { useSession } from '@/lib/contexts/SessionContext';

import styles from "./SessionOwnershipBadge.module.css";

export default function SessionOwnershipBadge() {
  const { sessionData, isOwner, togglePrivacy } = useSession();
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  const handleTogglePrivacy = async () => {
    if (!isOwner || isUpdatingPrivacy || !sessionData) return;

    setIsUpdatingPrivacy(true);
    try {
      await togglePrivacy();
    } catch (error) {
      console.error('Failed to update session privacy:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  if (!isOwner || !sessionData) return null;

  return (
      <Button
        className={styles.badge}
        onClick={handleTogglePrivacy}
        disabled={isUpdatingPrivacy}
        size="1"
        variant={sessionData.is_private ? "soft" : "solid"}
        color={sessionData.is_private ? "gray" : "green"}
      >
        {isUpdatingPrivacy ? 'Updating...' : (sessionData.is_private ? 'Private' : 'Public')}
      </Button>
  );
}