
import * as CodeMirror from "codemirror";
import "codemirror/mode/markdown/markdown";

/**
 * Markdown Extension Tokens
 *
 * - `$` Maybe a LaTeX
 * - `|` Maybe a Table Col Separator
 */
const tokenBreakRE = /[^\\][$|]/;

const listRE = /^(?:[*\-+]|^[0-9]+([.)]))\s+/;
const urlRE = /^((?:(?:aaas?|about|acap|adiumxtra|af[ps]|aim|apt|attachment|aw|beshare|bitcoin|bolo|callto|cap|chrome(?:-extension)?|cid|coap|com-eventbrite-attendee|content|crid|cvs|data|dav|dict|dlna-(?:playcontainer|playsingle)|dns|doi|dtn|dvb|ed2k|facetime|feed|file|finger|fish|ftp|geo|gg|git|gizmoproject|go|gopher|gtalk|h323|hcp|https?|iax|icap|icon|im|imap|info|ipn|ipp|irc[6s]?|iris(?:\.beep|\.lwz|\.xpc|\.xpcs)?|itms|jar|javascript|jms|keyparc|lastfm|ldaps?|magnet|mailto|maps|market|message|mid|mms|ms-help|msnim|msrps?|mtqp|mumble|mupdate|mvn|news|nfs|nih?|nntp|notes|oid|opaquelocktoken|palm|paparazzi|platform|pop|pres|proxy|psyc|query|res(?:ource)?|rmi|rsync|rtmp|rtsp|secondlife|service|session|sftp|sgn|shttp|sieve|sips?|skype|sm[bs]|snmp|soap\.beeps?|soldat|spotify|ssh|steam|svn|tag|teamspeak|tel(?:net)?|tftp|things|thismessage|tip|tn3270|tv|udp|unreal|urn|ut2004|vemmi|ventrilo|view-source|webcal|wss?|wtai|wyciwyg|xcon(?:-userid)?|xfire|xmlrpc\.beeps?|xmpp|xri|ymsgr|z39\.50[rs]?):(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]|\([^\s()<>]*\))+(?:\([^\s()<>]*\)|[^\s`*!()\[\]{};:'".,<>?«»“”‘’]))/i; // from CodeMirror/mode/gfm
const emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const url2RE = /^\.{0,2}\/[^\>\s]+/;
const hashtagRE = /^(?:[-()/a-zA-Z0-9ァ-ヺー-ヾｦ-ﾟｰ０-９Ａ-Ｚａ-ｚぁ-ゖ゙-ゞー々ぁ-んァ-ヾ一-\u9FEF㐀-䶵﨎﨏﨑﨓﨔﨟﨡﨣﨤﨧-﨩]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d])+/;

export type TokenFunc = (
  stream: CodeMirror.StringStream,
  state: DgitState
) => string;

export interface MarkdownStateLine {
  stream: CodeMirror.StringStream;
  header?: boolean;
  hr?: boolean;
  fencedCodeEnd?: boolean;
}

export interface MarkdownState {
  f: TokenFunc;

  prevLine: MarkdownStateLine;
  thisLine: MarkdownStateLine;

  block: TokenFunc;
  htmlState: any; // HTMLState
  indentation: number;

  localMode: CodeMirror.Mode<any>;
  localState: any;

  inline: TokenFunc;
  text: TokenFunc;

  formatting: string | string[] | false;
  linkText: boolean;
  linkHref: boolean;
  linkTitle: boolean;

  // hidden state
  image?: boolean;
  imageMarker?: boolean;
  imageAltText?: boolean;

  /** -1 means code-block and +1,2,3... means ``inline ` quoted codes`` */
  code: false | number;
  em: false | string;
  strong: false | string;
  mark: false | string;
  ins: false | string;
  sub: false | string;
  sup: false | string;
  header: number;
  setext: 0 | 1 | 2; // current line is afxHeader before ---- ======
  hr: boolean;
  taskList: boolean;
  list: true | null | false; // true: bullet, null: list text, false: not a list
  listStack: number[];
  quote: number;
  indentedCode: boolean;
  trailingSpace: number;
  trailingSpaceNewLine: boolean;
  strikethrough: boolean;
  emoji: boolean;
  fencedEndRE: null | RegExp; // usually is /^```+ *$/

  // temp
  indentationDiff?: number; // indentation minus list's indentation
}

export type InnerModeExitChecker = (
  stream: CodeMirror.StringStream,
  state: DgitState
) => {
  endPos?: number;
  skipInnerMode?: boolean;
  style?: string;
};

export interface DgitState extends MarkdownState {
  dgitTable: TableType;
  dgitTableID: string;
  dgitTableColumns: string[];
  dgitTableCol: number;
  dgitTableRow: number;
  dgitOverride: TokenFunc;

  dgitHashtag: HashtagType;

  dgitInnerStyle: string;
  dgitInnerExitChecker: InnerModeExitChecker;
  dgitInnerMode: CodeMirror.Mode<any>;
  dgitInnerState: any;

  dgitLinkType: LinkType;
  dgitNextMaybe: NextMaybe;

  dgitNextState: DgitState;
  dgitNextStyle: string;
  dgitNextPos: number;
}

export const enum HashtagType {
  NONE = 0,
  NORMAL, // hashtag text with no unescaped spaces
  WITH_SPACE, // hashtag text
}

export const enum TableType {
  NONE = 0,
  SIMPLE, //   table | column
  NORMAL, // | table | column |
}

const SimpleTableRE = /^\s*[^\|].*?\|.*[^|]\s*$/;
const SimpleTableLooseRE = /^\s*[^\|].*\|/; // unfinished | row
const NormalTableRE = /^\s*\|[^\|]+\|.+\|\s*$/;
const NormalTableLooseRE = /^\s*\|/; // | unfinished row

export const enum NextMaybe {
  NONE = 0,
  FRONT_MATTER, // only appears once, for each Doc
  FRONT_MATTER_END, // endline of front_matter not reached
}

export const enum LinkType {
  NONE = 0,
  BARELINK, // [link]
  FOOTREF, // [^ref]
  NORMAL, // [text](url) or [text][doc]
  WIKILINK, // [[url|text]]
  FOOTNOTE, // [footnote]:
  MAYBE_FOOTNOTE_URL, // things after colon
  BARELINK2, // [some-name][]  except latter []
  FOOTREF2, // [text][doc]  the [doc] part
}

const linkStyle = {
  [LinkType.BARELINK]: "dgit-barelink",
  [LinkType.BARELINK2]: "dgit-barelink2",
  [LinkType.WIKILINK]: "dgit-wikilink",
  [LinkType.FOOTREF]: "dgit-barelink dgit-footref",
  [LinkType.FOOTNOTE]: "dgit-footnote line-Dgit-footnote",
  [LinkType.FOOTREF2]: "dgit-footref2",
};

function resetTable(state: DgitState) {
  state.dgitTable = TableType.NONE;
  state.dgitTableColumns = [];
  state.dgitTableID = null;
  state.dgitTableCol = state.dgitTableRow = 0;
}

const listInQuoteRE = /^\s+((\d+[).]|[-*+])\s+)?/;

const defaultTokenTypeOverrides = {
  hr: "line-Dgit-hr line-background-Dgit-hr-bg hr",
  // Dgit needs to know the level of header/indent. using tokenTypeOverrides is not enough
  // header: "line-Dgit-header header",
  // quote: "line-Dgit-quote quote",
  // Note: there are some list related process below
  list1: "list-1",
  list2: "list-2",
  list3: "list-3",
  code: "inline-code",
  hashtag: "hashtag meta",
};

CodeMirror.defineMode(
  "dgitmd",
  function (cmCfg, modeCfgUser) {
    var modeCfg = {
      front_matter: true,
      math: true,
      table: true,
      toc: true, // support [TOC] and [TOCM]
      orgModeMarkup: true, // support OrgMode-like Markup like #+TITLE: my document
      hashtag: false, // support #hashtag

      fencedCodeBlockHighlighting: true,
      name: "markdown",
      highlightFormatting: true,
      taskLists: true,
      strikethrough: true,
      emoji: true,

      /** @see defaultTokenTypeOverrides */
      tokenTypeOverrides: defaultTokenTypeOverrides as Record<string, string>,
    };
    Object.assign(modeCfg, modeCfgUser);
    if (modeCfg.tokenTypeOverrides !== defaultTokenTypeOverrides) {
      modeCfg.tokenTypeOverrides = Object.assign(
        {},
        defaultTokenTypeOverrides,
        modeCfg.tokenTypeOverrides
      ) as Record<string, string>;
    }
    modeCfg["name"] = "markdown";

    /** functions from CodeMirror Markdown mode closure. Only for status checking */
    var rawClosure = {
      htmlBlock: null,
    };

    var rawMode: CodeMirror.Mode<MarkdownState> = CodeMirror.getMode(
      cmCfg,
      modeCfg
    );
    var newMode: CodeMirror.Mode<DgitState> = { ...rawMode } as any;

    newMode.startState = function () {
      var ans = rawMode.startState() as DgitState;
      resetTable(ans);
      ans.dgitOverride = null;
      ans.dgitInnerExitChecker = null;
      ans.dgitInnerMode = null;
      ans.dgitLinkType = LinkType.NONE;
      ans.dgitNextMaybe = modeCfg.front_matter
        ? NextMaybe.FRONT_MATTER
        : NextMaybe.NONE;
      ans.dgitNextState = null;
      ans.dgitNextStyle = null;
      ans.dgitNextPos = null;
      ans.dgitHashtag = HashtagType.NONE;
      return ans;
    };

    newMode.copyState = function (s) {
      var ans = rawMode.copyState(s) as DgitState;
      const keys: (keyof DgitState)[] = [
        "dgitLinkType",
        "dgitNextMaybe",
        "dgitTable",
        "dgitTableID",
        "dgitTableCol",
        "dgitTableRow",
        "dgitOverride",
        "dgitInnerMode",
        "dgitInnerStyle",
        "dgitInnerExitChecker",
        "dgitNextPos",
        "dgitNextState",
        "dgitNextStyle",
        "dgitHashtag",
      ];
      for (const key of keys) ans[key as any] = s[key];

      ans.dgitTableColumns = s.dgitTableColumns.slice(0);

      if (s.dgitInnerMode)
        ans.dgitInnerState = CodeMirror.copyState(
          s.dgitInnerMode,
          s.dgitInnerState
        );

      return ans;
    };

    newMode.blankLine = function (state) {
      var ans: string | void;

      var innerMode = state.dgitInnerMode;
      if (innerMode) {
        if (innerMode.blankLine) ans = innerMode.blankLine(state.dgitInnerState);
      } else {
        ans = rawMode.blankLine(state);
      }

      if (!ans) ans = "";

      if (state.code === -1) {
        ans += " line-Dgit-codeblock line-background-Dgit-codeblock-bg";
      }
      resetTable(state);
      return ans.trim() || null;
    };

    newMode.indent = function (state, textAfter) {
      var mode = state.dgitInnerMode || rawMode;
      var f = mode.indent;

      if (typeof f === "function") return f.apply(mode, arguments);
      return CodeMirror.Pass;
    };

    newMode.innerMode = function (state) {
      if (state.dgitInnerMode)
        return { mode: state.dgitInnerMode, state: state.dgitInnerState };
      return rawMode.innerMode(state);
    };

    newMode.token = function (stream, state) {
      if (state.dgitOverride) return state.dgitOverride(stream, state);

      if (state.dgitNextMaybe === NextMaybe.FRONT_MATTER) {
        // Only appears once for each Doc
        if (stream.string === "---") {
          state.dgitNextMaybe = NextMaybe.FRONT_MATTER_END;
          return enterMode(stream, state, "yaml", {
            style: "dgit-frontmatter",
            fallbackMode: () => createDummyMode("---"),
            exitChecker: function (stream, state) {
              if (stream.string === "---") {
                // found the endline of front_matter
                state.dgitNextMaybe = NextMaybe.NONE;
                return { endPos: 3 };
              } else {
                return null;
              }
            },
          });
        } else {
          state.dgitNextMaybe = NextMaybe.NONE;
        }
      }

      const wasInHTML = state.f === rawClosure.htmlBlock;
      const wasInCodeFence = state.code === -1;
      const bol = stream.start === 0;

      const wasLinkText = state.linkText;
      const wasLinkHref = state.linkHref;

      let inMarkdown = !(wasInCodeFence || wasInHTML);
      let inMarkdownInline =
        inMarkdown && !(state.code || state.indentedCode || state.linkHref);

      var ans = "";
      var tmp: RegExpMatchArray;

      if (inMarkdown) {
        // now implement some extra features that require higher priority than CodeMirror's markdown

        //#region Math
        if (
          modeCfg.math &&
          inMarkdownInline &&
          (tmp = stream.match(/^\${1,2}/, false))
        ) {
          let endTag = tmp[0];
          let mathLevel = endTag.length as 1 | 2;
          if (
            mathLevel === 2 ||
            stream.string.slice(stream.pos).match(/[^\\]\$/)
          ) {
            // $$ may span lines, $ must be paired
            let texMode = CodeMirror.getMode(cmCfg, {
              name: "stex",
            });
            let noTexMode = texMode["name"] !== "stex";
            ans += enterMode(stream, state, texMode, {
              style: "math",
              skipFirstToken: noTexMode, // if stex mode exists, current token is valid in stex
              fallbackMode: () => createDummyMode(endTag),
              exitChecker: createSimpleInnerModeExitChecker(endTag, {
                style:
                  "formatting formatting-math formatting-math-end math-" +
                  mathLevel,
              }),
            });
            if (noTexMode) stream.pos += tmp[0].length;
            ans +=
              " formatting formatting-math formatting-math-begin math-" +
              mathLevel;
            return ans;
          }
        }
        //#endregion

        //#region [OrgMode] markup
        if (
          bol &&
          modeCfg.orgModeMarkup &&
          (tmp = stream.match(/^\#\+(\w+\:?)\s*/))
        ) {
          // Support #+TITLE: This is the title of the document

          if (!stream.eol()) {
            state.dgitOverride = (stream, state) => {
              stream.skipToEnd();
              state.dgitOverride = null;
              return "string dgit-orgmode-markup";
            };
          }

          return "meta formatting-dgit-orgmode-markup dgit-orgmode-markup line-Dgit-orgmode-markup";
        }
        //#endregion

        //#region [TOC] in a single line
        if (bol && modeCfg.toc && stream.match(/^\[TOCM?\]\s*$/i)) {
          return "meta line-Dgit-toc dgit-toc";
        }
        //#endregion

        //#region Extra markdown inline extenson
        if (inMarkdownInline) {
          // transform unformatted URL into link
          if (
            !state.dgitLinkType &&
            (stream.match(urlRE) || stream.match(emailRE))
          ) {
            return "url";
          }
        }
        //#endregion
      }

      // now enter markdown

      if (state.dgitNextState) {
        stream.pos = state.dgitNextPos;
        ans += " " + (state.dgitNextStyle || "");
        Object.assign(state, state.dgitNextState);
        state.dgitNextState = null;
        state.dgitNextStyle = null;
        state.dgitNextPos = null;
      } else {
        ans += " " + (rawMode.token(stream, state) || "");
      }

      // add extra styles
      if (state.dgitHashtag !== HashtagType.NONE) {
        ans += " " + modeCfg.tokenTypeOverrides.hashtag;
      }

      /** Try to capture some internal functions from CodeMirror Markdown mode closure! */
      if (!rawClosure.htmlBlock && state.htmlState)
        rawClosure.htmlBlock = state.f;

      const inHTML = state.f === rawClosure.htmlBlock;
      const inCodeFence = state.code === -1;
      inMarkdown = inMarkdown && !(inHTML || inCodeFence);
      inMarkdownInline =
        inMarkdownInline &&
        inMarkdown &&
        !(state.code || state.indentedCode || state.linkHref);

      // If find a markdown extension token (which is not escaped),
      // break current parsed string into two parts and the first char of next part is the markdown extension token
      if (inMarkdownInline && (tmp = stream.current().match(tokenBreakRE))) {
        stream.pos = stream.start + tmp.index + 1; // rewind
      }
      var current = stream.current();

      if (inHTML != wasInHTML) {
        if (inHTML) {
          ans += " dgit-html-begin";
          rawClosure.htmlBlock = state.f;
        } else {
          ans += " dgit-html-end";
        }
      }

      if (wasInCodeFence || inCodeFence) {
        if (!state.localMode || !wasInCodeFence)
          ans = ans.replace("inline-code", "");
        ans += " line-Dgit-codeblock line-background-Dgit-codeblock-bg";
        if (inCodeFence !== wasInCodeFence) {
          if (!inCodeFence)
            ans +=
              " line-Dgit-codeblock-end line-background-Dgit-codeblock-end-bg";
          else if (!wasInCodeFence)
            ans +=
              " line-Dgit-codeblock-begin line-background-Dgit-codeblock-begin-bg";
        }
      }

      if (inMarkdown) {
        let tableType = state.dgitTable;

        //#region [Table] Reset
        if (bol && tableType) {
          const rowRE =
            tableType == TableType.SIMPLE
              ? SimpleTableLooseRE
              : NormalTableLooseRE;
          if (rowRE.test(stream.string)) {
            // still in table
            state.dgitTableCol = 0;
            state.dgitTableRow++;
          } else {
            // end of a table
            resetTable(state);
          }
        }
        //#endregion

        //#region Header, indentedCode, quote

        if (bol && state.header) {
          if (
            /^(?:---+|===+)\s*$/.test(stream.string) &&
            state.prevLine &&
            state.prevLine.header
          ) {
            ans +=
              " line-Dgit-header-line line-Dgit-header-line-" +
              state.header;
          } else {
            ans += " line-Dgit-header line-Dgit-header-" + state.header;
          }
        }

        if (state.indentedCode) {
          ans += " dgit-indented-code";
        }

        if (state.quote) {
          // mess up as less as possible
          if (stream.eol()) {
            ans += " line-Dgit-quote line-Dgit-quote-" + state.quote;
            if (!/^ {0,3}\>/.test(stream.string))
              ans += " line-Dgit-quote-lazy"; // ">" is omitted
          }

          if (bol && (tmp = current.match(/^\s+/))) {
            stream.pos = tmp[0].length; // rewind
            ans += " dgit-indent-in-quote";
            return ans.trim();
          }

          // make indentation (and potential list bullet) monospaced
          if (/^>\s+$/.test(current) && stream.peek() != ">") {
            stream.pos = stream.start + 1; // rewind!
            current = ">";
            state.dgitOverride = (stream, state) => {
              stream.match(listInQuoteRE);
              state.dgitOverride = null;
              return (
                "dgit-indent-in-quote line-Dgit-quote line-Dgit-quote-" +
                state.quote
              );
            };
          }
        }

        //#endregion

        //#region List

        let maxNonCodeIndentation =
          (state.listStack[state.listStack.length - 1] || 0) + 3;
        let tokenIsIndent =
          bol &&
          /^\s+$/.test(current) &&
          (state.list !== false ||
            stream.indentation() <= maxNonCodeIndentation);
        let tokenIsListBullet = state.list && /formatting-list/.test(ans);

        if (
          tokenIsListBullet ||
          (tokenIsIndent &&
            (state.list !== false || stream.match(listRE, false)))
        ) {
          let listLevel = (state.listStack && state.listStack.length) || 0;
          if (tokenIsIndent) {
            if (stream.match(listRE, false)) {
              // next token is 1. 2. or bullet
              if (state.list === false) listLevel++;
            } else {
              while (
                listLevel > 0 &&
                stream.pos < state.listStack[listLevel - 1]
              ) {
                listLevel--; // find the real indent level
              }
              if (!listLevel) {
                // not even a list
                return ans.trim() || null;
              }
              ans += ` line-Dgit-list-line-nobullet line-Dgit-list-line line-Dgit-list-line-${listLevel}`;
            }
            ans += ` dgit-list-indent dgit-list-indent-${listLevel}`;
          } else if (tokenIsListBullet) {
            // no space before bullet!
            ans += ` line-Dgit-list-line line-Dgit-list-line-${listLevel}`;
          }
        }

        //#endregion

        //#region mark, ins, sub, sup
        // TODO: Implement support
        //#endregion

        //#region Link, BareLink, Footnote, Wikilink etc

        if (stream.current() === "[" && stream.eat("[")) {
          current = "[[";
        }
        if (stream.current() === "]" && stream.eat("]")) {
          current = "]]";
        }

        if (wasLinkText !== state.linkText) {
          if (!wasLinkText) {
            if (current === "[[" || current === "]]") {
              // Check wiki link
              state.dgitLinkType = LinkType.WIKILINK;
            } else {
              // entering a link
              tmp = stream.match(/^([^\]]+)\](\(| ?\[|\:)?/, false);
              if (!tmp) {
                // maybe met a line-break in link text?
                state.dgitLinkType = LinkType.BARELINK;
              } else if (!tmp[2]) {
                // barelink
                if (tmp[1].charAt(0) === "^") {
                  state.dgitLinkType = LinkType.FOOTREF;
                } else {
                  state.dgitLinkType = LinkType.BARELINK;
                }
              } else if (tmp[2] === ":") {
                // footnote
                state.dgitLinkType = LinkType.FOOTNOTE;
              } else if (
                (tmp[2] === "[" || tmp[2] === " [") &&
                stream.string.charAt(stream.pos + tmp[0].length) === "]"
              ) {
                // [barelink2][]
                state.dgitLinkType = LinkType.BARELINK2;
              } else {
                state.dgitLinkType = LinkType.NORMAL;
              }
            }
          } else {
            // leaving a link
            if (state.dgitLinkType in linkStyle)
              ans += " " + linkStyle[state.dgitLinkType];

            if (state.dgitLinkType === LinkType.FOOTNOTE) {
              state.dgitLinkType = LinkType.MAYBE_FOOTNOTE_URL;
            } else {
              state.dgitLinkType = LinkType.NONE;
            }
          }
        }

        if (wasLinkHref !== state.linkHref) {
          if (!wasLinkHref) {
            // [link][doc] the [doc] part
            if (current === "[" && stream.peek() !== "]") {
              state.dgitLinkType = LinkType.FOOTREF2;
            }
          } else if (state.dgitLinkType) {
            // leaving a Href
            ans += " " + linkStyle[state.dgitLinkType];
            state.dgitLinkType = LinkType.NONE;
          }
        }

        if (state.dgitLinkType !== LinkType.NONE) {
          if (state.dgitLinkType in linkStyle) {
            ans += " " + linkStyle[state.dgitLinkType];
          }

          if (
            state.dgitLinkType === LinkType.WIKILINK &&
            current !== "[[" &&
            current !== "]]"
          ) {
            let eaten = false;
            while (stream.eat(/[^|\]]/)) {
              eaten = true;
            }
            if (eaten || stream.peek().match(/[\|\]]/)) {
              if (stream.peek() === "]") {
                // [[a|b]] => b
                // [[ab]]  => ab
                ans += " " + "wikilink-name";
              } else {
                // [[a|b]] => a|
                stream.eat("|");
                ans += " " + "wikilink-url";
              }
              current = stream.current();
            }
          }

          if (state.dgitLinkType === LinkType.MAYBE_FOOTNOTE_URL) {
            if (!/^(?:\]\:)?\s*$/.test(current)) {
              // not spaces
              if (urlRE.test(current) || url2RE.test(current))
                ans += " dgit-footnote-url";
              else ans = ans.replace("string url", "");
              state.dgitLinkType = LinkType.NONE; // since then, can't be url anymore
            }
          }
        }

        //#endregion

        //#region start of an escaped char
        if (/formatting-escape/.test(ans) && current.length > 1) {
          // CodeMirror merge backslash and escaped char into one token, which is not good
          // Use dgitOverride to separate them

          let escapedLength = current.length - 1;
          let escapedCharStyle =
            ans.replace("formatting-escape", "escape") + " dgit-escape-char";
          state.dgitOverride = (stream, state) => {
            // one-time token() func
            stream.pos += escapedLength;
            state.dgitOverride = null;
            return escapedCharStyle.trim();
          };

          ans += " dgit-escape-backslash";
          stream.pos -= escapedLength;
          return ans;
        }
        //#endregion

        //#region [Table] Creating Table and style Table Separators

        if (!ans.trim() && modeCfg.table) {
          // string is unformatted

          let isTableSep = false;

          if (current.charAt(0) === "|") {
            // is "|xxxxxx", separate "|" and "xxxxxx"
            stream.pos = stream.start + 1; // rewind to end of "|"
            current = "|";
            isTableSep = true;
          }

          if (isTableSep) {
            // if not inside a table, try to construct one
            if (!tableType) {
              // check 1: current line meet the table format
              if (SimpleTableRE.test(stream.string))
                tableType = TableType.SIMPLE;
              else if (NormalTableRE.test(stream.string))
                tableType = TableType.NORMAL;

              // check 2: check every column's alignment style
              let rowStyles: string[];
              if (tableType) {
                let nextLine = stream.lookAhead(1);

                if (tableType === TableType.NORMAL) {
                  if (!NormalTableRE.test(nextLine)) {
                    tableType = TableType.NONE;
                  } else {
                    // remove leading / tailing pipe char
                    nextLine = nextLine
                      .replace(/^\s*\|/, "")
                      .replace(/\|\s*$/, "");
                  }
                } else if (tableType === TableType.SIMPLE) {
                  if (!SimpleTableRE.test(nextLine)) {
                    tableType = TableType.NONE;
                  }
                }

                if (tableType) {
                  rowStyles = nextLine.split("|");
                  for (let i = 0; i < rowStyles.length; i++) {
                    let row = rowStyles[i];

                    if (/^\s*--+\s*:\s*$/.test(row)) row = "right";
                    else if (/^\s*:\s*--+\s*$/.test(row)) row = "left";
                    else if (/^\s*:\s*--+\s*:\s*$/.test(row)) row = "center";
                    else if (/^\s*--+\s*$/.test(row)) row = "default";
                    else {
                      // ouch, can't be a table
                      tableType = TableType.NONE;
                      break;
                    }

                    rowStyles[i] = row;
                  }
                }
              }

              // step 3: made it
              if (tableType) {
                // successfully made one
                state.dgitTable = tableType;
                state.dgitTableColumns = rowStyles;
                state.dgitTableID = "T" + stream.lineOracle.line;
                state.dgitTableRow = state.dgitTableCol = 0;
              }
            }

            // then
            if (tableType) {
              const colUbound = state.dgitTableColumns.length - 1;
              if (
                tableType === TableType.NORMAL &&
                ((state.dgitTableCol === 0 &&
                  /^\s*\|$/.test(stream.string.slice(0, stream.pos))) ||
                  stream.match(/^\s*$/, false))
              ) {
                ans += ` dgit-table-sep dgit-table-sep-dummy`;
              } else if (state.dgitTableCol < colUbound) {
                const row = state.dgitTableRow;
                const col = state.dgitTableCol++;
                if (col == 0) {
                  ans += ` line-Dgit-table_${state.dgitTableID} line-Dgit-table-${tableType} line-Dgit-table-row line-Dgit-table-row-${row}`;
                }
                ans += ` dgit-table-sep dgit-table-sep-${col}`;
              }
            }
          }
        }
        //#endregion

        if (tableType && state.dgitTableRow === 1) {
          // fix a stupid problem:    :------: is not emoji
          if (/emoji/.test(ans)) ans = "";
        }

        //#region HTML Block
        //
        // See https://github.github.com/gfm/#html-blocks type3-5

        if (inMarkdownInline && current === "<") {
          let endTag: string = null;
          if (stream.match(/^\![A-Z]+/)) endTag = ">";
          else if (stream.match("?")) endTag = "?>";
          else if (stream.match("![CDATA[")) endTag = "]]>";

          if (endTag != null) {
            return enterMode(stream, state, null, {
              endTag,
              style: (ans + " comment dgit-cdata-html").trim(),
            });
          }
        }

        //#endregion

        //#region Hashtag
        if (modeCfg.hashtag && inMarkdownInline) {
          switch (state.dgitHashtag) {
            case HashtagType.NONE:
              if (
                current === "#" &&
                !state.linkText &&
                !state.image &&
                (bol || /^\s*$/.test(stream.string.charAt(stream.start - 1)))
              ) {
                let escape_removed_str = stream.string
                  .slice(stream.pos)
                  .replace(/\\./g, "");

                if ((tmp = hashtagRE.exec(escape_removed_str))) {
                  if (/^\d+$/.test(tmp[0])) state.dgitHashtag = HashtagType.NONE;
                  else state.dgitHashtag = HashtagType.NORMAL;

                  escape_removed_str = escape_removed_str.slice(tmp[0].length);
                  do {
                    // found tailing #
                    if (
                      escape_removed_str[0] === "#" &&
                      (escape_removed_str.length === 1 ||
                        !hashtagRE.test(escape_removed_str[1]))
                    ) {
                      state.dgitHashtag = HashtagType.WITH_SPACE;
                      break;
                    }
                    if ((tmp = escape_removed_str.match(/^\s+/))) {
                      escape_removed_str = escape_removed_str.slice(
                        tmp[0].length
                      );
                      if ((tmp = escape_removed_str.match(hashtagRE))) {
                        // found a space + valid tag text parts
                        // continue this loop until tailing # is found
                        escape_removed_str = escape_removed_str.slice(
                          tmp[0].length
                        );
                        continue;
                      }
                    }
                    // can't establish a Hashtag WITH_SPACE. stop
                    break;
                  } while (true);
                }

                if (state.dgitHashtag) {
                  ans +=
                    " formatting formatting-hashtag hashtag-begin " +
                    modeCfg.tokenTypeOverrides.hashtag;
                }
              }
              break;
            case HashtagType.NORMAL:
              let endHashTag = false;

              if (!/formatting/.test(ans) && !/^\s*$/.test(current)) {
                // if invalid hashtag char found, break current parsed text part
                tmp = current.match(hashtagRE);
                let backUpChars = current.length - (tmp ? tmp[0].length : 0);
                if (backUpChars > 0) {
                  stream.backUp(backUpChars);
                  endHashTag = true;
                }
              }

              if (!endHashTag) endHashTag = stream.eol(); // end of line
              if (!endHashTag) endHashTag = !hashtagRE.test(stream.peek()); // or next char is invalid to hashtag name
              // escaped char is always invisible to stream. no worry

              if (endHashTag) {
                ans += " hashtag-end";
                state.dgitHashtag = HashtagType.NONE;
              }
              break;
            case HashtagType.WITH_SPACE:
              // escaped char is always invisible to stream. no worry
              if (current === "#") {
                // end the hashtag if meet unescaped #
                ans = ans.replace(/\sformatting-header(?:-\d+)?/g, "");
                ans += " formatting formatting-hashtag hashtag-end";
                state.dgitHashtag = HashtagType.NONE;
              }
              break;
          }
        }
        //#endregion
      }

      return ans.trim() || null;
    };

    function modeOverride(
      stream: CodeMirror.StringStream,
      state: DgitState
    ): string {
      const exit = state.dgitInnerExitChecker(stream, state);
      const extraStyle = state.dgitInnerStyle;

      let ans =
        ((!exit || !exit.skipInnerMode) &&
          state.dgitInnerMode.token(stream, state.dgitInnerState)) ||
        "";

      if (extraStyle) ans += " " + extraStyle;
      if (exit) {
        if (exit.style) ans += " " + exit.style;
        if (exit.endPos) stream.pos = exit.endPos;

        state.dgitInnerExitChecker = null;
        state.dgitInnerMode = null;
        state.dgitInnerState = null;
        state.dgitOverride = null;
      }

      return ans.trim() || null;
    }

    /**
     * advance Markdown tokenizing stream
     *
     * @returns true if success, then `state.dgitNextState` & `state.dgitNextStyle` will be set
     */
    function advanceMarkdown(
      stream: CodeMirror.StringStream,
      state: DgitState
    ) {
      if (stream.eol() || state.dgitNextState) return false;

      var oldStart = stream.start;
      var oldPos = stream.pos;

      stream.start = oldPos;
      var newState = { ...state };
      var newStyle = rawMode.token(stream, newState);

      state.dgitNextPos = stream.pos;
      state.dgitNextState = newState;
      state.dgitNextStyle = newStyle;

      // console.log("ADVANCED!", oldStart, oldPos, stream.start, stream.pos)
      // console.log("ADV", newStyle, newState)

      stream.start = oldStart;
      stream.pos = oldPos;

      return true;
    }

    function createDummyMode(endTag: string): CodeMirror.Mode<void> {
      return {
        token(stream) {
          var endTagSince = stream.string.indexOf(endTag, stream.start);
          if (endTagSince === -1) stream.skipToEnd();
          // endTag not in this line
          else if (endTagSince === 0) stream.pos += endTag.length;
          // current token is endTag
          else {
            stream.pos = endTagSince;
            if (stream.string.charAt(endTagSince - 1) === "\\") stream.pos++;
          }

          return null;
        },
      };
    }

    function createSimpleInnerModeExitChecker(
      endTag: string,
      retInfo?: ReturnType<InnerModeExitChecker>
    ): InnerModeExitChecker {
      if (!retInfo) retInfo = {};

      return function (stream, state) {
        if (stream.string.substr(stream.start, endTag.length) === endTag) {
          retInfo.endPos = stream.start + endTag.length;
          return retInfo;
        }
        return null;
      };
    }

    interface BasicInnerModeOptions {
      skipFirstToken?: boolean;
      style?: string;
    }

    interface InnerModeOptions1 extends BasicInnerModeOptions {
      fallbackMode: () => CodeMirror.Mode<any>;
      exitChecker: InnerModeExitChecker;
    }

    interface InnerModeOptions2 extends BasicInnerModeOptions {
      endTag: string;
    }

    type InnerModeOptions = InnerModeOptions1 | InnerModeOptions2;

    /**
     * switch to another mode
     *
     * After entering a mode, you can then set `dgitInnerExitStyle` and `dgitInnerState` of `state`
     *
     * @returns if `skipFirstToken` not set, returns `innerMode.token(stream, innerState)`, meanwhile, stream advances
     */
    function enterMode(
      stream: CodeMirror.StringStream,
      state: DgitState,
      mode: string | CodeMirror.Mode<any>,
      opt: InnerModeOptions
    ): string {
      if (typeof mode === "string") mode = CodeMirror.getMode(cmCfg, mode);

      if (!mode || mode["name"] === "null") {
        if ("endTag" in opt) mode = createDummyMode(opt.endTag);
        else
          mode = typeof opt.fallbackMode === "function" && opt.fallbackMode();

        if (!mode) throw new Error("no mode");
      }

      state.dgitInnerExitChecker =
        "endTag" in opt
          ? createSimpleInnerModeExitChecker(opt.endTag)
          : opt.exitChecker;
      state.dgitInnerStyle = opt.style;
      state.dgitInnerMode = mode;
      state.dgitOverride = modeOverride;
      state.dgitInnerState = CodeMirror.startState(mode);

      var ans = opt.style || "";
      if (!opt.skipFirstToken) {
        ans += " " + mode.token(stream, state.dgitInnerState);
      }
      return ans.trim();
    }

    return newMode;
  }
);

CodeMirror.defineMIME("text/x-dgitmd", "dgitmd");
