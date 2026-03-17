import { Metadata } from 'next';
import MarkdownPage from '@/components/MarkdownPage/MarkdownPage';

export const metadata: Metadata = {
    title: 'Terms of Service - Pitch Share',
    description: 'Terms of Service for Pitch Share application',
};

export default function TermsOfServicePage() {
    return (
        <MarkdownPage filePath="src/app/legal/terms-of-service/content.md" />
    );
}