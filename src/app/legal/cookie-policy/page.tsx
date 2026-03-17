import { Metadata } from 'next';
import MarkdownPage from '@/components/MarkdownPage/MarkdownPage';

export const metadata: Metadata = {
    title: 'Cookie Policy - Pitch Share',
    description: 'Cookie Policy for Pitch Share application',
};

export default function CookiePolicyPage() {
    return (
        <MarkdownPage filePath="src/app/legal/cookie-policy/content.md" />
    );
}