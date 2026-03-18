'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Flex } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

import styles from "./LegalNavigation.module.css";

export default function LegalNavigation() {
    const pathname = usePathname();
    const isMainLegalPage = pathname === '/legal';

    if (isMainLegalPage) {
        return null;
    }

    return (
        <Flex align="center" asChild gap="1">
            <Link href="/legal" className={styles.link}>
                <ArrowLeftIcon /> Back to Legal
            </Link>
        </Flex>
    );
}