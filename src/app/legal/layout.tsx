import { Metadata } from 'next';
import { Container } from '@radix-ui/themes';

export const metadata: Metadata = {
    title: 'Legal - Pitch Share',
    description: 'Legal information and policies for Pitch Share',
};

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container size="3" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {children}
        </Container>
    );
}