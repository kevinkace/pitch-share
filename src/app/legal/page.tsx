import { Metadata } from 'next';
import Link from 'next/link';
import { Card, Flex } from '@radix-ui/themes';

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: 'Legal Information - Pitch Share',
    description: 'Legal information, policies, and terms for Pitch Share',
};

export default function LegalIndexPage() {
    const lastUpdated = 'March 17, 2026';

    return (
        <div>
            <h1>Legal Information</h1>

            <p>
                This page contains all the legal documents related to your use of Pitch Share.
                Please take a moment to review these important policies and terms.
            </p>

            <p>
                Also note, I'm just a single developer maintaining this project, so while I strive to keep everything up to date and accurate, there may be occasional oversights.
            </p>

            <p>
                If you need to get in touch regarding these legal documents, you can either open an issue on our GitHub repository or contact us directly at <a href="mailto:support@pitchshare.app">support@pitchshare.app</a>.
            </p>

            <p className={styles.lastUpdated}>
                Last updated: {lastUpdated}
            </p>

            <Flex direction="column" gap="5" className={styles.linkContainer}>
                <Card asChild>
                    <Link href="/legal/privacy-policy">
                        <h3>Privacy Policy</h3>
                        <p>
                            Learn how we collect, use, and protect your personal information when you use Pitch Share.
                            This includes details about data storage, sharing practices, and your privacy rights.
                        </p>
                    </Link>
                </Card>

                <Card asChild>
                    <Link href="/legal/terms-of-service">
                        <h3>Terms of Service</h3>
                        <p>
                            The legal agreement between you and Pitch Share that governs your use of our service.
                            This covers acceptable use, account responsibilities, and service limitations.
                        </p>
                    </Link>
                </Card>

                <Card asChild>
                    <Link href="/legal/cookie-policy">
                        <h3>Cookie Policy</h3>
                        <p>
                            Information about how we use cookies and similar technologies to enhance your experience,
                            provide security, and analyze usage patterns.
                        </p>
                    </Link>
                </Card>
            </Flex>

            <h2>Questions or Concerns?</h2>
            <p>
                If you have any questions about these legal documents or our policies,
                please don't hesitate to contact us through your account settings or our support channels.
            </p>
            <p>
                We're committed to transparency and will be happy to address any concerns you may have.
            </p>
        </div>
    );
}