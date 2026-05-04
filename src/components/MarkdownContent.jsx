import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const files = import.meta.glob('/src/content/**/*.md', { query: '?raw' });

export default function MarkdownContent({ subfolder, filename, variables = {} }) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        const fullPath = `/src/content/${subfolder}/${filename}.md`;

        if (files[fullPath]) {
            files[fullPath]().then(file => setContent(file.default))
        }
    }, [subfolder, filename]);

    return (
        <ReactMarkdown>
            {content?.replace(/\{(.*?)\}/g, (match, key) => {
                return variables[key.trim() || match]
            })}
        </ReactMarkdown>
    )
}