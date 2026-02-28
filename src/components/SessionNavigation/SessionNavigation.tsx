import Link from 'next/link';
import { Button, Flex } from '@radix-ui/themes';

import styles from './SessionNavigation.module.css';

interface SessionNavigationProps {
  previousSession: string | null;
  nextSession: string | null;
  previousDate: string | null;
  nextDate: string | null;
  inline?: boolean;
}

export default function SessionNavigation({
  previousSession,
  nextSession,
  previousDate,
  nextDate,
  inline,
}: SessionNavigationProps) {
  return (
    <Flex className={inline ? styles.navigationInline : styles.navigation} justify="between" align="center">
        {previousSession && (
          <Button asChild variant="soft" size="3">
            <Link href={`/${previousSession}`} className={styles.navButton}>
              <div className={styles.buttonContent}>
                <div>Previous Session</div>
                {previousDate && (
                  <div className={styles.dateLabel}>{previousDate}</div>
                )}
              </div>
            </Link>
          </Button>
        )}
        {nextSession && (
          <Button asChild variant="soft" size="3">
            <Link href={`/${nextSession}`} className={styles.navButton}>
              <div className={styles.buttonContent}>
                <div>Next Session</div>
                {nextDate && (
                  <div className={styles.dateLabel}>{nextDate}</div>
                )}
              </div>
            </Link>
          </Button>
        )}
    </Flex>
  );
}