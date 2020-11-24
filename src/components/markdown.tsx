import React, {useState, useEffect, useRef} from 'react'
import { useMarkdownApi } from '~/utils/api'
import '@styles/codemirror.css'
import 'vickymd/theme/editor_themes/light.css'
import 'vickymd/theme/editor_themes/dark.css'
import 'vickymd/theme/editor_themes/one-dark.css'
import 'vickymd/theme/editor_themes/solarized-light.css'
import * as CodeMirror from "codemirror";
import { openURL } from "~/utils/utils";
import "~/mode/dgitmd";

import * as FoldImage from "vickymd/addon/fold-image"
import * as VickyMD from "vickymd";

type Props = {
  theme?: string;
}

const Markdown: React.FC<Props> = (props) => {
  const [editor, setEditor] = useState(null)
  const [theme, setTheme] = useState(props.theme)
  const [markdown, setMarkdown] = useState(null)
  const [cursorPosition, setCursorPosition] = useState({
    line: 0,
    ch: 0,
  });
  const textareaEl = useRef(null)
  const [options, setOptions] = useState({
    mode: {
      name: "hypermd",
      hashtag: true,
    },
    lineNumbers: false,
    foldGutter: false,
    keyMap: "hypermd",
    showCursorWhenSelecting: true,
    // hmdClick: (info: any, cm: any) => {
    //   let { text, url } = info;
    //   if (info.type === "link" || info.type === "url") {
    //     const footnoteRef = text.match(/\[[^[\]]+\](?:\[\])?$/); // bare link, footref or [foot][] . assume no escaping char inside
    //     if (!footnoteRef && (info.ctrlKey || info.altKey) && url) {
    //       // just open URL
    //       openURL(url);
    //       return false; // Prevent default click event
    //     }
    //   }
    // },
  })
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    if (textareaEl != null) {
      window.cm = VickyMD.fromTextArea(textareaEl.current, {
        inputStyle: "contenteditable",
        hmdFold: {
          image: true,
          link: true,
          math: true,
          html: true, // maybe dangerous
          emoji: true,
          widget: true,
          code: true,
        },
      });
      window.cm.setValue(data.markdown);
      window.cm.setSize("100%", "100%");
      window.cm.on("cursorActivity", (instance) => {
        const cursor = instance.getCursor();
        if (cursor) {
          setCursorPosition({
            line: cursor.line,
            ch: cursor.ch,
          });
        }
      });
      setEditor(window.cm);
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