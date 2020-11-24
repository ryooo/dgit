import React, {useState, useEffect} from 'react'
import { useMarkdownApi } from '~/utils/api'
import '@styles/components/Codemirror.css'
import * as CodeMirror from "codemirror";
import "~/mode/dgitmd";

type Props = {}

const Markdown: React.FC<Props> = ({}) => {
  const [markdown, setMarkdown] = useState(null)
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    const textarea: any = document.getElementById("editor")
    if (textarea != null) {
      let editor = CodeMirror.fromTextArea(textarea, {
          mode: "dgitmd",
          lineNumbers: false,
          indentUnit: 2,
      });
      editor.setValue(data.markdown);
      editor.setSize("100%", "100%");
    }
  });

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  
  return (
      <>
        <textarea id="editor"></textarea>
      </>
    );
}

export default Markdown;