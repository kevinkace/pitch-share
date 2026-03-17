import { Metadata } from 'next';
import Link from 'next/link';
import { Heading, Text, Card, Flex, Section } from '@radix-ui/themes';

export const metadata: Metadata = {
    title: 'Legal Information - Pitch Share',
    description: 'Legal information, policies, and terms for Pitch Share',
};

export default function LegalIndexPage() {
    const lastUpdated = 'March 17, 2026';

    return (
        <>
            <Heading size="8" mb="4">Legal Information</Heading>
            <Text size="3" color="gray" mb="6">
                Important legal documents and policies for Pitch Share users
            </Text>

            <Section mb="6">
                <Text mb="4">
                    This page contains all the legal documents related to your use of Pitch Share.
                    Please take a moment to review these important policies and terms.
                </Text>
                <Text size="2" color="gray" mb="6">
                    Last updated: {lastUpdated}
                </Text>
            </Section>

            <Flex direction="column" gap="4">
                <Card asChild>
                    <Link href="/legal/privacy-policy" style={{ textDecoration: 'none' }}>
                        <Flex direction="column" gap="2" p="4">
                            <Heading size="4">Privacy Policy</Heading>
                            <Text color="gray">
                                Learn how we collect, use, and protect your personal information when you use Pitch Share.
                                This includes details about data storage, sharing practices, and your privacy rights.
                            </Text>
                        </Flex>
                    </Link>
                </Card>

                <Card asChild>
                    <Link href="/legal/terms-of-service" style={{ textDecoration: 'none' }}>
                        <Flex direction="column" gap="2" p="4">
                            <Heading size="4">Terms of Service</Heading>
                            <Text color="gray">
                                The legal agreement between you and Pitch Share that governs your use of our service.
                                This covers acceptable use, account responsibilities, and service limitations.
                            </Text>
                        </Flex>
                    </Link>
                </Card>

                <Card asChild>
                    <Link href="/legal/cookie-policy" style={{ textDecoration: 'none' }}>
                        <Flex direction="column" gap="2" p="4">
                            <Heading size="4">Cookie Policy</Heading>
                            <Text color="gray">
                                Information about how we use cookies and similar technologies to enhance your experience,
                                provide security, and analyze usage patterns.
                            </Text>
                        </Flex>
                    </Link>
                </Card>
            </Flex>

            <Section mt="6">
                <Heading size="4" mb="3">Questions or Concerns?</Heading>
                <Text>
                    If you have any questions about these legal documents or our policies,
                    please don't hesitate to contact us through your account settings or our support channels.
                    We're committed to transparency and will be happy to address any concerns you may have.
                </Text>
            </Section>
        </>
    );
}