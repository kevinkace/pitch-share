import clsx from 'clsx';

import styles from './Container.module.css';

export default function Container({ children, width }: { children: React.ReactNode, width?: string }) {
    return (
        <main className={clsx(
            styles.main,
            {
                [styles.flex]: width === 'flex'
            }
        )}>
            {children}
        </main>
    )
}