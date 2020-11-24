import React, {useState, useEffect} from 'react'
import { useMarkdownApi } from '~/utils/api'

import {EditorView, keymap, highlightSpecialChars, drawSelection, indentOnInput} from "@codemirror/next/view"
import {Extension, EditorState} from "@codemirror/next/state"
import {history, historyKeymap} from "@codemirror/next/history"
import {foldGutter, foldKeymap} from "@codemirror/next/fold"
import {lineNumbers} from "@codemirror/next/gutter"
import {defaultKeymap} from "@codemirror/next/commands"
import {bracketMatching} from "@codemirror/next/matchbrackets"
import {closeBrackets, closeBracketsKeymap} from "@codemirror/next/closebrackets"
import {searchKeymap} from "@codemirror/next/search"
import {autocompletion, completionKeymap} from "@codemirror/next/autocomplete"
import {commentKeymap} from "@codemirror/next/comment"
import {rectangularSelection} from "@codemirror/next/rectangular-selection"
import {gotoLineKeymap} from "@codemirror/next/goto-line"
import {highlightActiveLine, highlightSelectionMatches} from "@codemirror/next/highlight-selection"
import {defaultHighlighter} from "@codemirror/next/highlight"
import {lintKeymap} from "@codemirror/next/lint"

type Props = {}

const Markdown: React.FC<Props> = ({}) => {
  const [markdown, setMarkdown] = useState(null)
  const { data, error } = useMarkdownApi('sample_docs/test.md');

  useEffect(() => {
    const parent = document.querySelector("#editor")
    if (parent != null) {
      let myView = new EditorView({
        state: EditorState.create({
          doc: "hello world!",
          extensions: [
            lineNumbers(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            defaultHighlighter,
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap([
              ...closeBracketsKeymap,
              ...defaultKeymap,
              ...searchKeymap,
              ...historyKeymap,
              ...foldKeymap,
              ...commentKeymap,
              ...gotoLineKeymap,
              ...completionKeymap,
              ...lintKeymap
            ])
          ],
        })
      });
      parent.appendChild(myView.dom);
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