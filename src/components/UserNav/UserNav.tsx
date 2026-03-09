'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/Button/Button'
import styles from './UserNav.module.css'

export function UserNav() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Button href="/login">
        Sign In
      </Button>
    )
  }

  return (
    <div className={styles.userNav}>
      <span className={styles.userEmail}>
        {user.email}
      </span>
      <Button onclick={signOut}>
        Sign Out
      </Button>
    </div>
  )
}