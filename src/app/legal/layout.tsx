import { Metadata } from 'next';

import Container from '@/components/Container/Container';

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
        <Container>
            {children}
        </Container>
    );
}