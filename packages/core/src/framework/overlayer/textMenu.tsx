import React, { MouseEvent, useState } from 'react';
import { Editor, Range, Node, Text, Transforms } from 'slate';
import { ReactEditor, useSlate, useSlateStatic } from 'slate-react';
import { Paragraph } from '../../builtinPlugin/paragraph';
import { useDebounce } from '../../hooks';
import { ColorItem } from './insert';
import { Lens, lens } from '@zhujianshi/lens';
import { createShared } from '@zhujianshi/use-lens';

const initStatus = {
  bold: false,
  italic: false,
  lineThrough: false,
  underline: false,
  txtColor: '',
  bgColor: '',
};
const { useLens, useSetLens } = createShared<typeof initStatus>(initStatus);

const storeLens = lens(
  (x) => x,
  (x) => x,
) as Lens<
  typeof initStatus,
  typeof initStatus,
  typeof initStatus,
  typeof initStatus
>;

const txtColorInfo = [
  {
    keywords: ['default', 'text', 'content'],
    value: '',
    title: '默认',
  },
  {
    keywords: ['black', 'text', 'content'],
    value: 'text-black',
    title: '黑色',
  },
  {
    keywords: ['gray', 'text', 'content'],
    value: 'text-gray-300',
    title: '灰色',
  },
  {
    keywords: ['red', 'text', 'content'],
    value: 'text-red-300',
    title: '红色',
  },
  {
    keywords: ['yellow', 'text', 'content'],
    value: 'text-yellow-300',
    title: '黄色',
  },
  {
    keywords: ['green', 'text', 'content'],
    value: 'text-green-300',
    title: '绿色',
  },
  {
    keywords: ['blue', 'text', 'content'],
    value: 'text-blue-300',
    title: '蓝色',
  },
  {
    keywords: ['purple', 'text', 'content'],
    value: 'text-purple-300',
    title: '紫色',
  },
  {
    keywords: ['pink', 'text', 'content'],
    value: 'text-pink-300',
    title: '粉色',
  },
  {
    keywords: ['indigo', 'text', 'content'],
    value: 'text-indigo-300',
    title: '靛蓝',
  },
];

const bgColorInfo = [
  {
    keywords: ['default', 'bg', 'background'],
    value: '',
    title: '默认',
  },
  {
    keywords: ['default', 'bg', 'background'],
    value: 'bg-white',
    title: '白色',
  },
  {
    keywords: ['gray', 'bg', 'background'],
    value: 'bg-gray-50',
    title: '灰色',
  },
  { keywords: ['red', 'bg', 'background'], value: 'bg-red-50', title: '红色' },
  {
    keywords: ['yellow', 'bg', 'background'],
    value: 'bg-yellow-50',
    title: '黄色',
  },
  {
    keywords: ['green', 'bg', 'background'],
    value: 'bg-green-50',
    title: '绿色',
  },
  {
    keywords: ['blue', 'bg', 'background'],
    value: 'bg-blue-50',
    title: '蓝色',
  },
  {
    keywords: ['purple', 'bg', 'background'],
    value: 'bg-purple-50',
    title: '紫色',
  },
  {
    keywords: ['pink', 'bg', 'background'],
    value: 'bg-pink-50',
    title: '粉色',
  },
  {
    keywords: ['indigo', 'bg', 'background'],
    value: 'bg-indigo-50',
    title: '靛蓝',
  },
];

export const useClickAway = (fn: (e: React.MouseEvent) => void, ref: any) => {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;

  React.useEffect(() => {
    const trigger = (e: any) => {
      if (ref.current) {
        const dom = ref.current as HTMLElement;
        if (dom.contains(e.target)) return;
      }
      fnRef.current && fnRef.current(e);
    };
    document.addEventListener('click', trigger);
    return () => document.removeEventListener('click', trigger);
  });
};

const isStyleActive = (texts: Text[], mark: string) =>
  texts.every((t) => !!t[mark]);

const getColor = (texts: Text[], key: string) => {
  return texts.every((t) => t[key] === texts[0][key]) ? texts[0][key] : '';
};

const TextStyleGroup = () => {
  const [activeMap] = useLens(storeLens);
  const editor = useSlateStatic();
  return (
    <div className="lla-text-style-group">
      <div
        className={`lla-text-style-item lla-text-style-item--bold${
          activeMap.bold ? ' active' : ''
        }`}
        onClick={handleClick('bold')}
      >
        B
      </div>
      <div
        className={`lla-text-style-item lla-text-style-item--italic${
          activeMap.italic ? ' active' : ''
        }`}
        onClick={handleClick('italic')}
      >
        i
      </div>
      <div
        className={`lla-text-style-item lla-text-style-item--underline${
          activeMap.underline ? ' active' : ''
        }`}
        onClick={handleClick('underline')}
      >
        U
      </div>
      <div
        className={`lla-text-style-item lla-text-style-item--linethrough${
          activeMap.lineThrough ? ' active' : ''
        }`}
        onClick={handleClick('lineThrough')}
      >
        S
      </div>
    </div>
  );

  function handleClick(k: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeMap[k]) {
        Editor.removeMark(editor, k);
      } else {
        Editor.addMark(editor, k, true);
      }
    };
  }
};

const TextColor = () => {
  const [activeMap] = useLens(storeLens);
  const [isOpen, setIsOpen] = React.useState(false);
  const editor = useSlateStatic();
  const ref = React.useRef<HTMLDivElement>(null);
  useClickAway(() => {
    setIsOpen(false);
  }, ref);

  return (
    <div className="lla-text-color relative" ref={ref}>
      <div className="contents" onMouseOver={() => setIsOpen(true)}>
        <div
          className={`${activeMap.bgColor || ''} ${activeMap.txtColor || ''}`}
        >
          A
        </div>
        <svg viewBox="0 0 30 30" className="lla-text-color-drop-icon">
          <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
        </svg>
      </div>
      {isOpen && (
        <div className="absolute lla-text-color-menu -top-10">
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">背景颜色</div>
            {bgColorInfo.map(({ title, value }, i) => (
              <ColorItem
                color={value}
                // active={i + bgColorStartIdx === activeIdx}
                title={title}
                description={`将背景设为${title}`}
                key={i}
                // onMouseOver={() => setActiveIdx(i + bgColorStartIdx)}
                onClick={(e) => handleClick('bgColor')(e, value)}
              ></ColorItem>
            ))}
          </div>
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">文字</div>
            {txtColorInfo.map(({ title, value }, i) => (
              <ColorItem
                color={value}
                // active={i + txtColorItemsStartIdx === activeIdx}
                title={title}
                description={`将文字设为${title}`}
                key={i}
                // onMouseOver={() => setActiveIdx(i + txtColorItemsStartIdx)}
                onClick={(e) => handleClick('txtColor')(e, value)}
              ></ColorItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function handleClick(k: string) {
    return (e: React.MouseEvent, value: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (activeMap[k]) {
        Editor.removeMark(editor, k);
      } else {
        Editor.addMark(editor, k, value);
      }
    };
  }
};

export const TextActionMenu = () => {
  const positionRef = React.useRef<HTMLDivElement>(null);
  const setActiveStyleMap = useSetLens(storeLens);
  const editor = useSlate();
  const [adjustPosition] = useDebounce(adjustPositionRaw, 100);
  React.useEffect(() => adjustPosition());

  return (
    <div className="lla-text-action-menu" ref={positionRef}>
      <TextStyleGroup></TextStyleGroup>
      <TextColor></TextColor>
    </div>
  );

  function adjustPositionRaw() {
    const el = positionRef.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }
    const [paragraphEntry] = Editor.nodes(editor, { match: Paragraph.is });
    if (!paragraphEntry) return el.removeAttribute('style');
    const texts = Array.from(
      Editor.nodes(editor, { at: selection, match: Text.isText }),
    ).map(([t]) => t);
    // console.log(texts);
    setActiveStyleMap({
      bold: isStyleActive(texts, 'bold'),
      italic: isStyleActive(texts, 'italic'),
      lineThrough: isStyleActive(texts, 'lineThrough'),
      underline: isStyleActive(texts, 'underline'),
      bgColor: getColor(texts, 'bgColor'),
      txtColor: getColor(texts, 'txtColor'),
    });
    const domSelection = window.getSelection();
    if (!domSelection) return el.removeAttribute('style');
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  }
};
