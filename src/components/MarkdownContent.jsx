import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const files = import.meta.glob('/src/content/**/*.md', {
    query: '?raw',
    import: 'default'
});

export default function MarkdownContent({ subfolder, filename, variables = {} }) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        async function loadMarkdown() {
            const path = `/src/content/${subfolder}/${filename}.md`;

            const importer = files[path];

            if (!importer)
                return;

            const markdown = await importer();

            setContent(markdown)
        }

        loadMarkdown()
    }, [subfolder, filename]);

    if (!content)
        return null;

    return (
        <ReactMarkdown>
            {content.replace(/\{(.*?)\}/g, (_, key) => {
                return variables[key.trim()] ?? `{${key}}`;
            })}
        </ReactMarkdown>
    )
}