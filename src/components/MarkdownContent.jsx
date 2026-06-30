import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Loader from './Loader';

const files = import.meta.glob('/src/content/**/*.md', {
  query: '?raw',
  import: 'default'
});

export default function MarkdownContent({ subfolder, filename, variables = {}, onLoad }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function loadMarkdown() {
      const path = `/src/content/${subfolder}/${filename}.md`;

      const importer = files[path];

      if (!importer) {
        if (onLoad) onLoad(false);
        return;
      }

      const markdown = await importer();
      setContent(markdown);

      if (onLoad) onLoad(true);
    }

    loadMarkdown()
  }, [subfolder, filename, onLoad]);

  if (!content)
    return (<Loader />);

  return (
    <ReactMarkdown>
      {content.replace(/\{(.*?)\}/g, (_, key) => {
        return variables[key.trim()] ?? `{${key}}`;
      })}
    </ReactMarkdown>
  )
}