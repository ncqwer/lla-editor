import { createShared } from '@zhujianshi/use-lens';
import { lens } from '@zhujianshi/lens';
import React from 'react';
import { NodeEntry, Element, Editor, Path, Transforms } from 'slate';
import { useSlateStatic } from 'slate-react';
import domAlign from 'dom-align';

export type ContextMenuInfo = {
  path: Path;
  element: Element;
  targetGet: () => HTMLElement | null;
};

const { useLens, SharedProvider, useSetLens } = createShared<ContextMenuInfo>(
  {},
);

const storeLens = lens(
  (x: ContextMenuInfo) => x,
  (x: ContextMenuInfo) => x,
);

const ContextMenuItem: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    title: string;
    shotkey?: string;
  }
> = ({ title, shotkey, children, ...others }) => {
  return (
    <div className="lla-context-menu__item" {...others}>
      <div className="lla-context-menu__item__icon">{children}</div>
      <div className="lla-context-menu__item__title">{title}</div>
      <div className="lla-context-menu__item__shotkey">{shotkey}</div>
    </div>
  );
};

const EMPTY = {};
export const ContextMenu = () => {
  return (
    <SharedProvider initialValue={EMPTY}>
      <ContextMenuWrapper></ContextMenuWrapper>
    </SharedProvider>
  );
};

const ContextMenuWrapper = () => {
  const [info, setInfo] = useLens(storeLens);
  const editor = useSlateStatic();
  React.useEffect(() => {
    return editor.registerOverLayer('contextMenu', {
      open: (info) => setInfo(info),
    });
  }, [setInfo, editor]);
  if (!info.path) return null;
  return (
    <div
      className="lla-overlay w-screen h-screen z-50 bg-transparent fixed top-0 left-0"
      onClick={() => setInfo({} as any)}
    >
      <ContextMenuImpl></ContextMenuImpl>
    </div>
  );
};

const ContextMenuImpl = () => {
  const [search, setSearch] = React.useState('');
  const editor = useSlateStatic();
  const [info, setInfo] = useLens(storeLens);
  const ref = React.useRef<HTMLDivElement>(null);
  const { element, targetGet, path } = info;
  const [visiable, setVisiable] = React.useState(false);
  React.useEffect(() => {
    const target = targetGet();
    if (ref.current && target) {
      domAlign(ref.current, target, {
        points: ['tc', 'bc'],
        overflow: {
          alwaysByViewport: true,
          adjustX: true,
          adjustY: true,
        },
      });
    }
    setVisiable(true);
  }, []);
  return (
    <div
      className={`lla-context-menu ${visiable ? 'visible' : 'invisible'}`}
      ref={ref}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="lla-context-menu__search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="lla-context-menu__group">
        <ContextMenuItem
          title="向上插入段落"
          shotkey="Shift+Up"
          onMouseDown={handleInsertUp}
          onTouchStart={handleInsertUp}
        >
          <svg
            viewBox="0 0 30 30"
            // class="moveTo"
            // style="width: 17px; height: 17px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"
          >
            <polygon points="7 26 7 9 25.188 9 21.594 12.594 23 14 29 8 23 2 21.594 3.406 25.188 7 5 7 5 26"></polygon>
          </svg>
        </ContextMenuItem>
        <ContextMenuItem
          title="向下插入段落"
          shotkey="Shift+Down"
          onMouseDown={handleInsertDown}
          onTouchStart={handleInsertDown}
        >
          <svg
            viewBox="0 0 30 30"
            style={{
              transform: 'rotateZ(180deg)',
            }}
            // style="width: 17px; height: 17px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"
          >
            <polygon points="7 26 7 9 25.188 9 21.594 12.594 23 14 29 8 23 2 21.594 3.406 25.188 7 5 7 5 26"></polygon>
          </svg>
        </ContextMenuItem>
        <ContextMenuItem
          title="删除"
          shotkey="Del"
          onClick={handleRemove}
          onTouchStart={handleRemove}
        >
          <svg viewBox="0 0 30 30">
            <path d="M21,5c0-2.2-1.8-4-4-4h-4c-2.2,0-4,1.8-4,4H2v2h2v22h22V7h2V5H21z M13,3h4c1.104,0,2,0.897,2,2h-8C11,3.897,11.897,3,13,3zM24,27H6V7h18V27z M16,11h-2v12h2V11z M20,11h-2v12h2V11z M12,11h-2v12h2V11z"></path>
          </svg>
        </ContextMenuItem>
        <ContextMenuItem
          title="复制"
          shotkey="⌘+D"
          onClick={handleCopy}
          onTouchStart={handleCopy}
        >
          <svg viewBox="0 0 30 30">
            <path d="M1,29h20V9H1V29z M3,11h16v16H3V11z M9,1v6h2V3h16v16h-4v2h6V1H9z"></path>
          </svg>
        </ContextMenuItem>
      </div>
    </div>
  );

  function handleRemove() {
    Transforms.removeNodes(editor, { at: path });
    // Transforms.select(editor, Editor.start(editor, path));
    setInfo({} as any);
  }

  function handleCopy() {
    const newElement = JSON.parse(JSON.stringify(element));
    Transforms.insertNodes(editor, newElement, { at: Path.next(path) });
    setInfo({} as any);
  }

  function handleInsertUp(e: any) {
    e.preventDefault();
    const newElement = editor.createParagraph('');
    const newPath = path;
    Editor.withoutNormalizing(editor, () => {
      Transforms.insertNodes(editor, newElement, { at: newPath });
      Transforms.select(editor, Editor.start(editor, newPath));
    });
    setInfo({} as any);
  }

  function handleInsertDown(e: any) {
    e.preventDefault();
    const newElement = editor.createParagraph('');
    const newPath = Path.next(path);
    Editor.withoutNormalizing(editor, () => {
      Transforms.insertNodes(editor, newElement, { at: newPath });
      Transforms.select(editor, Editor.start(editor, newPath));
    });
    setInfo({} as any);
  }
};
