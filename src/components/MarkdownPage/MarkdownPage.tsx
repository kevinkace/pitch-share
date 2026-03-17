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
    h1: ({ children, ...props }) => (
        <Heading size="8" mb="4" {...props}>
            {children}
        </Heading>
    ),
    h2: ({ children, ...props }) => (
        <Heading size="5" mb="3" {...props}>
            {children}
        </Heading>
    ),
    h3: ({ children, ...props }) => (
        <Heading size="3" mb="2" {...props}>
            {children}
        </Heading>
    ),
    p: ({ children, ...props }) => (
        <Text mb="3" {...props}>
            {children}
        </Text>
    ),
    em: ({ children, ...props }) => (
        <Text size="2" color="gray" mb="6" {...props}>
            {children}
        </Text>
    ),
    ul: ({ children, ...props }) => (
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }} {...props}>
            {children}
        </ul>
    ),
    li: ({ children, ...props }) => (
        <li style={{ marginBottom: '0.25rem' }} {...props}>
            {children}
        </li>
    ),
    strong: ({ children, ...props }) => (
        <strong {...props}>{children}</strong>
    ),
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