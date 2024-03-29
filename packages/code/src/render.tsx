import React from 'react';
import { Path, Range, Node, Editor, Text, Point } from 'slate';
import {
  LLAOverLayer,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  Decorate,
  ExtendRenderLeafProps,
  textPropsIs,
  LLAConfig,
  ConfigHelers,
  SharedApi,
} from '@lla-editor/core';
import { Code, CodeBlock, CodeLine, PrismText } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateSelection,
  useSlateStatic,
} from 'slate-react';
import { Transforms } from 'slate';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-visual-basic';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-wasm';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-haskell';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism-tomorrow.css';

// https://github.com/GitbookIO/slate-edit-code
const createDecoration = ({
  path,
  textStart,
  textEnd,
  start,
  end,
  className,
}: {
  className: string;
  path: Path;
} & Record<
  'textStart' | 'textEnd' | 'start' | 'end',
  number
>): Range | null => {
  if (start >= textEnd || end <= textStart) {
    return null;
  }

  // Shrink to this text boundaries
  start = Math.max(start, textStart);
  end = Math.min(end, textEnd);

  // Now shift offsets to be relative to this text
  start -= textStart;
  end -= textStart;

  return {
    anchor: {
      path,
      offset: start,
    },
    focus: {
      path,
      offset: end,
    },
    type: 'prismjs-token',
    className,
  };
};
const weakMap = new WeakMap();

export const decorate: Decorate<CodeBlock> = (next, [element, elementPath]) => {
  if (!Code.isCode(element)) return next();
  if (weakMap.has(element)) return weakMap.get(element);
  const textEntry = Array.from(Node.texts(element));
  const blockTotalText = textEntry.map((t) => t[0].text).join('\n');
  const language = element.language;

  const grammer = Prism.languages[language];
  const tokens = Prism.tokenize(blockTotalText, grammer);

  const [, decorations] = textEntry.reduce(
    (acc, [text, path]) => {
      const [textStart, outDecorations] = acc;
      const textEnd = textStart + text.text.length;

      function processToken(
        token: string | Prism.Token,
        type: null | string,
        info: [number, (Range | null)[]],
      ): [number, (Range | null)[]] {
        const [offset, innerDecorations] = info;
        if (typeof token === 'string') {
          let decoration = null;
          if (type) {
            decoration = createDecoration({
              path: elementPath.concat(path),
              textStart,
              textEnd,
              start: offset,
              end: offset + token.length,
              className: type,
            });
          }
          if (!decoration) return [offset + token.length, innerDecorations];
          return [offset + token.length, innerDecorations.concat(decoration)];
        } else {
          // typeof token === 'object'
          const currentClassName = [type]
            .concat(token.type, token.alias)
            .filter((x) => !!x)
            .join(' ');
          if (typeof token.content === 'string') {
            const decoration = createDecoration({
              path: elementPath.concat(path),
              textStart,
              textEnd,
              start: offset,
              end: offset + token.content.length,
              className: currentClassName,
            });
            if (!decoration)
              return [offset + token.content.length, innerDecorations];
            return [
              offset + token.content.length,
              innerDecorations.concat(decoration),
            ];
          } else {
            const c = token.content;
            if (!Array.isArray(c)) return info;
            return c.reduce(
              (innerAcc, content) =>
                processToken(content, token.type, innerAcc),
              info,
            );
          }
        }
      }

      const [, newDecorations] = tokens.reduce(
        (tokenAcc, token) => processToken(token, null, tokenAcc),
        [0, outDecorations],
      );
      return [textEnd + 1, newDecorations]; // '+1' for '/n'
    },
    [0, []] as [number, (Range | null)[]],
  );
  weakMap.set(element, decorations);
  return decorations;
};

const CodeLineElement: React.FC<ExtendRenderElementProps<CodeLine>> = ({
  children,
  attributes,
}) => {
  return (
    <div className={`lla-code-line`} {...attributes}>
      {children}
    </div>
  );
};

export const availableLanguage = Object.entries({
  c: ['c'],
  py: ['python', 'py'],
  java: ['java'],
  cpp: ['cpp', 'c++'],
  'c#': ['csharp', 'cs', 'dotnet'],
  vb: ['visual-basic', 'vb', 'vba'],
  jsx: ['javascript', 'js', 'jsx'],
  tsx: ['typescript', 'ts', 'tsx'],
  php: ['php'],
  wasm: ['wasm'],
  sql: ['sql'],
  markup: ['markup'],
  html: ['html', 'svg'],
  hs: ['haskell', 'hs'],
  css: ['css'],
  latex: ['latex', 'formula', 'katex'],
}).reduce(
  (acc, [k, v]) => ({
    ...acc,
    [v[0] as string]: {
      label: k,
      test: (str: string) => v.some((alias) => alias.startsWith(str)),
    },
  }),
  {} as Record<string, { label: string; test: (str: string) => boolean }>,
);

const alignOpts = { points: ['tl', 'bl'] };
const LanguageSelector: React.FC<{
  language: string;
  onLanguageChange: (v: string) => void;
}> = ({ language, onLanguageChange }) => {
  // const [language, onLanguageChange] = React.useState('java');
  const ref = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const getSearchResult = () => {
    if (!search) return Object.entries(availableLanguage);
    return Object.entries(availableLanguage).filter(([, { test }]) =>
      test(search),
    );
  };
  React.useEffect(() => {
    getSearchResult();
  }, []);
  return (
    <>
      <div
        ref={ref}
        className="lla-code-language"
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {availableLanguage[language]?.label}
        <svg viewBox="0 0 30 30">
          <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
        </svg>
      </div>
      {isOpen && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          targetGet={() => ref.current}
          alignOpts={alignOpts}
        >
          <div className="lla-code-language__menu">
            <div className="lla-code-language__search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="lla-code-language__item-group">
              {renderLanguage()}
            </div>
          </div>
        </LLAOverLayer>
      )}
    </>
  );

  function renderLanguage() {
    return (
      <div>
        {getSearchResult()?.map(([type]) => (
          <div
            key={type}
            className="lla-code-language__item"
            onClick={() => {
              onLanguageChange(type);
              setIsOpen(false);
            }}
            onTouchStart={() => {
              onLanguageChange(type);
              setIsOpen(false);
            }}
          >
            {type}
          </div>
        ))}
      </div>
    );
  }
};

const { useGetting } = ConfigHelers as SharedApi<LLAConfig>;

const KatexPreview = ({
  element,
  onClick,
  onElementFocused,
}: {
  element: CodeBlock;
  onClick?: () => void;
  onElementFocused: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const editor = useSlateStatic();
  const ref = React.useRef(null);
  const [katexHtml, setKatexHtml] = React.useState('');
  const [validState, setValidState] = React.useState(true);
  const isSelected = useSelected();
  const selection = useSlateSelection();
  const katex = useGetting(['code', 'katex']);

  const mathTex = React.useMemo(
    () =>
      Array.from(Node.texts(element))
        .map(([textNode]) => textNode.text)
        .join('\n'),
    [element],
  );

  const className = validState
    ? mathTex.length === 0
      ? 'lla-code-block-wrap__formula-preview lla-code-block-wrap__formula-preview--empty'
      : 'lla-code-block-wrap__formula-preview'
    : 'lla-code-block-wrap__formula-preview lla-code-block-wrap__formula-preview--error';
  React.useEffect(() => {
    try {
      const result = katex.renderToString(mathTex, { displayMode: true });
      setKatexHtml(result);
      setValidState(true);
    } catch (e) {
      if (e instanceof katex.ParseError) {
        setValidState(false);
        setKatexHtml('');
      } else {
        throw e;
      }
    }
  }, [mathTex, katex]);

  React.useEffect(() => {
    if (!isSelected) {
      onElementFocused(false);
      return;
    }
    if (!selection) {
      onElementFocused(false);
      return;
    }
    const path = ReactEditor.findPath(editor, element);
    if (Range.includes(selection, path)) {
      // only expanded when select and only select the whole element
      onElementFocused(
        Path.isAncestor(path, selection.anchor.path) &&
          Path.isAncestor(path, selection.focus.path),
      );
    } else {
      onElementFocused(true);
    }
  });
  return (
    <div
      ref={ref}
      contentEditable={false}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={className}
    >
      <span
        className="lla-code-block-wrap__formula-preview__latex-info"
        onClick={(e) => {
          e.stopPropagation();
          // router.push('/search?title=latex');
          window.open('https://www.latexlive.com/');
        }}
      >
        LaTex公式知多少
      </span>
      <div dangerouslySetInnerHTML={{ __html: katexHtml }} />
    </div>
  );
};

const CodeElement: React.FC<ExtendRenderElementProps<CodeBlock>> = ({
  attributes,
  element,
  children,
}) => {
  const { language } = element;
  const editor = useSlateStatic();
  const [isFormulaFocused, setIsFormulaFocused] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const isFormula = element.language === 'latex';
  const isReadonly = useReadOnly();
  return (
    <div
      className={`lla-code-block-wrap${
        isFormula ? ' lla-code-block-wrap--formula' : ''
      }${isFormulaFocused ? ' lla-code-block-wrap--selected' : ''}${
        isReadonly ? ' lla-code-block-wrap--readonly' : ''
      }`}
      {...attributes}
    >
      <div className={`lla-code-block lla-context-menu-target`}>
        <LanguageSelector
          language={language}
          onLanguageChange={(v) => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { language: v }, { at: path });
          }}
        ></LanguageSelector>
        <div
          ref={triggerRef}
          className="lla-context-menu-trigger "
          contentEditable={false}
          onClick={(e) => {
            e.stopPropagation();
            openContextMenu();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            openContextMenu();
          }}
        >
          ...
        </div>
        <div className={`lla-code-action-group`}></div>
        <pre
          className={`code language-${language}`}
          onCopy={(e) => {
            const { selection } = editor;

            if (!selection || Range.isCollapsed(selection)) return;
            const path = ReactEditor.findPath(editor, element);
            const [start, end] = Range.edges(selection);
            const [codeStart, codeEnd] = Editor.edges(editor, path);
            if (
              Point.isBefore(start, codeStart) ||
              Point.isAfter(end, codeEnd)
            ) {
              return;
            }
            // 仅仅复制code块，不进入slate复制逻辑;
            e.preventDefault();
            e.stopPropagation();

            let text = '';
            Array.from(
              Editor.nodes(editor, {
                at: selection,
                match: (n) => Text.isText(n),
              }),
            ).forEach(([node, path], idx) => {
              let t = (node as any).text;

              if (Path.equals(path, end.path)) {
                t = t.slice(0, end.offset);
              }

              if (Path.equals(path, start.path)) {
                t = t.slice(start.offset);
              }

              text += `${idx !== 0 ? '\n' : ''}${t}`;
            });
            e.clipboardData.setData('text/plain', text);
          }}
          onPaste={(e) => {
            const { selection } = editor;
            if (!selection) return;
            const path = ReactEditor.findPath(editor, element);
            const [start, end] = Range.edges(selection);
            const [codeStart, codeEnd] = Editor.edges(editor, path);
            if (Point.isBefore(start, codeStart) || Point.isAfter(end, codeEnd))
              return;

            const txt = e.clipboardData.getData('text/plain');
            if (!txt) return;
            e.stopPropagation();
            e.preventDefault();
            const [firstLine, ...otherLines] = txt.split('\n');
            Transforms.insertText(editor, firstLine);
            if (otherLines.length > 0)
              Transforms.insertNodes(
                editor,
                otherLines.map((str) => Code.createCodeLine(str)),
              );
          }}
        >
          <code>{children}</code>
        </pre>
      </div>
      {isFormula && (
        <KatexPreview
          element={element}
          onClick={() => {
            const path = ReactEditor.findPath(editor, element);
            // const newSelection = Editor.range(editor,path);
            Transforms.select(editor, path);
          }}
          onElementFocused={setIsFormulaFocused}
        ></KatexPreview>
      )}
    </div>
  );

  function openContextMenu() {
    const contextMenu = editor.getOvlerLayer('contextMenu');
    if (contextMenu) {
      contextMenu.open({
        path: ReactEditor.findPath(editor, element),
        element,
        targetGet: () => triggerRef.current,
      });
    }
  }
};

const PrismTokenElement: React.FC<ExtendRenderLeafProps<PrismText>> = ({
  leaf,
  children,
  attributes,
}) => {
  return (
    <span {...attributes} className={`${leaf.className} token`}>
      {children}
    </span>
  );
};

export const renderLeaf = [
  [textPropsIs(Code.isPrismText), elementRender(React.memo(PrismTokenElement))],
];

export const renderElement = [
  [elementPropsIs(Code.isCode), elementRender(React.memo(CodeElement))],
  [elementPropsIs(Code.isCodeLine), elementRender(React.memo(CodeLineElement))],
];
