import Link from 'next/link';
import { Button, Flex } from '@radix-ui/themes';

import styles from './SessionNavigation.module.css';


export default function SessionNavigation({session, inline }: {session: string, inline?: boolean}) {
  const { previousSession, nextSession, previousDate, nextDate } = {};

  return (
    <Flex className={inline ? styles.navigationInline : styles.navigation} justify="between" align="center">
        {previousSession && (
          <Button asChild variant="soft" size="3">
            <Link href={`/profile/sessions/${previousSession}`} className={styles.navButton}>
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
            <Link href={`/profile/sessions/${nextSession}`} className={styles.navButton}>
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