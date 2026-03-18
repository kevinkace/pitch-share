import { Metadata } from 'next';

import Container from '@/components/Container/Container';
import LegalNavigation from './components/LegalNavigation';

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
            <div>
                <LegalNavigation />
                {children}
            </div>
        </Container>
    );
}