import Link from 'next/link';
import { Button, Flex } from '@radix-ui/themes';

import styles from './SessionNavigation.module.css';

interface SessionNavigationProps {
  previousSession: string | null;
  nextSession: string | null;
  inline?: boolean;
}

export default function SessionNavigation({
  previousSession,
  nextSession,
  inline,
}: SessionNavigationProps) {
  return (
    <Flex className={inline ? styles.navigationInline : styles.navigation} justify="between" align="center">
      <div>
        {previousSession && (
          <Button asChild variant="soft" size="2">
            <Link href={`/${previousSession}`}>

              Previous Session
            </Link>
          </Button>
        )}
      </div>

      <div>
        {nextSession && (
          <Button asChild variant="soft" size="2">
            <Link href={`/${nextSession}`}>
              Next Session
            </Link>
          </Button>
        )}
      </div>
    </Flex>
  );
}