import Link from "next/link";
import { Flex, Text } from "@radix-ui/themes";

import Logo      from '@/components/Logo/Logo';
import Logotype from "@/components/Logotype/Logotype";
import Container from "@/components/Container/Container";

import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <Container className={styles.container}>
                <Flex direction="column" gap="4">
                    {/* Main footer content */}
                    <Flex justify="between" align="center" wrap="wrap" gap="4">
                        {/* Left side - Logo/Brand */}
                        <Flex align="center" gap="2" asChild>
                            <Link href="/">
                                <Logo size="1"/>
                                <Logotype />
                            </Link>
                        </Flex>

                        {/* Center - Legal Links */}
                        <Flex align="center" gap="4" wrap="wrap">
                            <Text size="2" asChild>
                                <Link href="/legal/privacy-policy">Privacy Policy</Link>
                            </Text>
                            <Text size="2" asChild>
                                <Link href="/legal/terms-of-service">Terms of Service</Link>
                            </Text>
                            <Text size="2" asChild>
                                <Link href="/legal/cookie-policy">Cookie Policy</Link>
                            </Text>
                        </Flex>

                        {/* Right side - Copyright */}
                        <Flex align="center" gap="4" className={styles.copyright}>
                            <Text size="2" color="gray">
                                © {currentYear} Pitch Share
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </Container>
        </footer>
    );
}