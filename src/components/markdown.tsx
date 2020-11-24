import React, {useState, useEffect, useRef} from 'react'
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

const Markdown: React.FC<Props> = (props) => {
  const [editor, setEditor] = useState(null)
  const [theme, setTheme] = useState(props.theme)
  const [markdown, setMarkdown] = useState(null)
  const textareaEl = useRef(null)
  const [options, setOptions] = useState({
    mode: "hypermd",
    lineNumbers: false,
    indentUnit: 2,
  })
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    if (textareaEl != null) {
      let editor = VickyMD.fromTextArea(textareaEl.current);
      editor.setValue(data.markdown);
      editor.setSize("100%", "100%");
      setEditor(editor);
    }
  }, [textareaEl]);

  useEffect(() => {
    if (editor !== null) {
      for (const key in options) {
          editor.setOption(key as any, options[key]);
      }
      editor.setOption("theme", props.theme);
    }
  }, [options, editor, props.theme]);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
      <>
        <textarea id="editor" style={{display: "none"}} ref={textareaEl}></textarea>
      </>
    );
}

export default Markdown;