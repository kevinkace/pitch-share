import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heading, Text, Section, Separator } from '@radix-ui/themes';
import type { Components } from 'react-markdown';

interface MarkdownPageProps {
    filePath: string;
}

const markdownComponents: Components = {
    hr: ({ ...props }) => (
        <Separator my="5" size="4" {...props} />
    ),
};

export default async function MarkdownPage({ filePath }: MarkdownPageProps) {
    let fileContents: string;
    let error: Error | null = null;

    try {
        const fullPath = path.join(process.cwd(), filePath);
        fileContents = await fs.readFile(fullPath, 'utf8');
    } catch (err) {
        console.error('Error reading markdown file:', err);
        error = err instanceof Error ? err : new Error('Unknown error');
    }

    if (error) {
        return (
            <Section>
                <Heading size="5" color="red" mb="3">
                    Error Loading Content
                </Heading>
                <Text>
                    Sorry, we couldn't load the content for this page. Please try again later.
                </Text>
            </Section>
        );
    }

    return (
        <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
        >
            {fileContents}
        </ReactMarkdown>
    );
}