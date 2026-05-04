import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownContent({ subfolder, filename, variables = {} }) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        async function loadMarkdown() {
            try {
                const response = await fetch(
                    `/src/content/${subfolder}/${filename}.md`
                );

                if (!response.ok)
                    return;

                const text = await response.text();

                setContent(text)
            } catch (err) {
                console.error(err)
            }
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