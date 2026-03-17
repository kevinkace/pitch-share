import Link from "next/link";
import { Flex, Text, Separator } from "@radix-ui/themes";

import Logo      from '@/components/Logo/Logo';
import Logotype from "@/components/Logotype/Logotype";
import Container from "@/components/Container/Container";

import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <Container className={styles.container}>
                <Flex justify="between" align="center" wrap="wrap">
                    {/* Left side - Logo/Brand */}
                    <Flex align="center" gap="2" asChild>
                        <Link href="/">
                            <Logo />
                            <Logotype />
                        </Link>
                    </Flex>

                    {/* Right side - Copyright */}
                    <Flex align="center" gap="4" className={styles.copyright}>
                        <Text size="2" color="gray">
                            © {currentYear} Pitch Share
                        </Text>
                    </Flex>
                </Flex>
            </Container>
        </footer>
    );
}