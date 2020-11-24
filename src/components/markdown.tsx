import React, {useState, useEffect} from 'react'
import { useMarkdownApi } from '~/utils/api'
import '@styles/components/codemirror.css'
import 'vickymd/theme/editor_themes/light.css'
import 'vickymd/theme/editor_themes/dark.css'
import 'vickymd/theme/editor_themes/one-dark.css'
import 'vickymd/theme/editor_themes/solarized-light.css'
import * as CodeMirror from "codemirror";
import "~/mode/dgitmd";

import * as VickyMD from "vickymd";

type Props = {
  theme?: string;
}

const Markdown: React.FC<Props> = ({theme}) => {
  const [markdown, setMarkdown] = useState(null)
  const [options, setOptions] = useState({
    mode: "hypermd",
    lineNumbers: false,
    indentUnit: 2,
    theme: theme,
  })
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    const textarea: any = document.getElementById("editor")
    if (textarea != null) {
      let editor = VickyMD.fromTextArea(textarea);
      editor.setValue(data.markdown);
      editor.setSize("100%", "100%");
    }
  }, []);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
      <>
        <textarea id="editor" style={{display: "none"}}></textarea>
      </>
    );
}

export default Markdown;