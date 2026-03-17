import { Metadata } from 'next';
import MarkdownPage from '@/components/MarkdownPage/MarkdownPage';

export const metadata: Metadata = {
    title: 'Privacy Policy - Pitch Share',
    description: 'Privacy policy for Pitch Share application',
};

export default function PrivacyPolicyPage() {
    return (
        <MarkdownPage filePath="src/app/legal/privacy-policy/content.md" />
    );
}