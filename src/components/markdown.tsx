import React, {useState, useEffect} from 'react'
import { useMarkdownApi } from '~/utils/api'

type Props = {}

const Markdown: React.FC<Props> = ({}) => {
  const [markdown, setMarkdown] = useState(null)
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    const parent = document.querySelector("#editor")
    if (parent != null) {
    }
  });

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
      <>
        <div>{data.markdown}</div>
        <div id="editor"></div>
      </>
    );
}

export default Markdown;