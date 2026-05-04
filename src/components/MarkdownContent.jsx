import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const files = import.meta.glob('/src/content/**/*.md', {
    query: '?raw',
    import: 'default'
});

export default function MarkdownContent({ subfolder, filename, variables = {} }) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        const path = `/src/content/${subfolder}/${filename}.md`;

        async function loadMarkdown() {
            const importer = files[path];

            if (!importer)
                return;

            const file = await importer();

            setContent(file);
        }

        loadMarkdown()
    }, [subfolder, filename]);

    return (
        <ReactMarkdown>
            {content?.replace(/\{(.*?)\}/g, (_, key) => {
                return variables[key.trim()] ?? `{${key}}`;
            })}
        </ReactMarkdown>
    )
}