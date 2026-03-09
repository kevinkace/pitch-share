import { Container } from '@/components/Container/Container'
import { Button } from '@/components/Button/Button'
import Link from 'next/link'
import styles from './page.module.css'

export default function AuthCodeError() {
  return (
    <div className={styles.errorPage}>
      <Container>
        <div className={styles.errorContainer}>
          <h1 className={styles.title}>Authentication Error</h1>
          <p className={styles.message}>
            {"Sorry, we couldn't sign you in. The magic link may have expired or been used already."}
          </p>
          <Link href="/login">
            <Button>
              Try Again
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}