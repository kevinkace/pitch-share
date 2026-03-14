import { Flex } from "@radix-ui/themes";
import clsx from 'clsx';

import styles from './Container.module.css';

export default function Container({ children, width, className }: { children: React.ReactNode, width?: string, className?: string }) {
    return (
        <Flex asChild gap="7" direction="column">
            <main className={clsx(
                styles.main,
                className,
                {
                    [styles.flex]: width === 'flex'
                }
            )}>
                {children}
            </main>
        </Flex>
    )
}