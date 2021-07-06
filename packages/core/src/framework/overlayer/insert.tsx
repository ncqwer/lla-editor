import React from 'react';
import { Path, Node, Editor, Transforms } from 'slate';
import { ReactEditor, useSlate, useSlateStatic } from 'slate-react';
import domAlign from 'dom-align';
import useThrottle from '../../hooks/useThrottle';
import { useEditorRuntime } from '..';
import { LLAElement } from '../../type';

export const InsertOverLayer = () => {
  const editor = useSlateStatic();
  const [targetPath, setTargetPath] = React.useState<Path | null>(null);
  const targetPathRef = React.useRef(targetPath);
  targetPathRef.current = targetPath;

  const ref = React.useRef<any>();
  React.useEffect(() => {
    return editor.registerOverLayer('insert', {
      open: setTargetPath,
      close: () => setTargetPath(null),
      up: () => ref?.current?.up(),
      down: () => ref?.current?.down(),
      enter: () => ref?.current?.enter(),
      isEmpty: () => !targetPathRef.current,
    });
  }, []);
  if (!targetPath) return null;
  return (
    <InsertOverLayerImpl
      path={targetPath}
      emptyPath={() => setTargetPath(null)}
      ref={ref}
    ></InsertOverLayerImpl>
  );
};

const InsertOverLayerImpl = React.forwardRef(
  ({ path, emptyPath }: { path: Path; emptyPath: () => void }, _outerRef) => {
    const editor = useSlate(); //这里需要时刻更新值
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (ref.current) {
        const element = Node.get(editor, path);
        const dom = ReactEditor.toDOMNode(editor, element);
        domAlign(ref.current, dom, {
          points: ['tl', 'bl'],
          overflow: {
            alwaysByViewport: true,
            // adjustX: true,
            adjustY: true,
          },
        });
      }
    }, [path]);

    return (
      <div
        className="lla-overlay w-screen h-screen z-50 bg-transparent fixed top-0 left-0"
        onClick={emptyPath}
      >
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          className="lla-insert-wrapper"
        >
          {useThrottle(handleCotent, 0)[0]()}
        </div>
      </div>
    );

    function handleCotent() {
      const element = Node.get(editor, path);
      const str = Node.string(element).slice(1);
      return (
        <InsertPannel
          ref={_outerRef}
          search={str}
          path={path}
          emptyPath={emptyPath}
        ></InsertPannel>
      );
    }
  },
);

const InsertPannelItem: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    imgSrc: string;
    title: string;
    active?: boolean;
    description: string;
  }
> = ({ imgSrc, title, description, active = false, ...others }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current && active) {
      (ref.current as any).scrollIntoViewIfNeeded(false);
    }
  }, [active]);
  return (
    <div
      ref={ref}
      className={`lla-insert__item ${active ? 'lla-insert__item--active' : ''}`}
      {...others}
    >
      <img src={imgSrc} alt={title} className="lla-insert__item-cover" />
      <div className="lla-insert__item-content">
        <div className="lla-insert__item-title">{title}</div>
        <div className="lla-insert__item-descritption">{description}</div>
      </div>
    </div>
  );
};

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

const searchColor = (search: string, colorInfo: typeof bgColorInfo) => {
  return colorInfo.filter(({ keywords }) =>
    keywords.some((keyword) => keyword.startsWith(search)),
  );
};

export const ColorItem: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    color: string;
    title: string;
    active?: boolean;
    description: string;
  }
> = ({ color, title, description, active = false, ...others }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current && active) {
      (ref.current as any).scrollIntoViewIfNeeded(false);
    }
  }, [active]);
  return (
    <div
      ref={ref}
      className={`lla-insert__item ${active ? 'lla-insert__item--active' : ''}`}
      {...others}
    >
      <div className={`lla-insert__item-color ${color || ''}`}>Bg</div>
      <div className="lla-insert__item-content">
        <div className="lla-insert__item-title">{title}</div>
        <div className="lla-insert__item-descritption">{description}</div>
      </div>
    </div>
  );
};

const InsertPannel = React.forwardRef(
  (
    {
      search,
      path,
      emptyPath,
      ...others
    }: {
      search: string;
      emptyPath: () => void;
      path: Path;
    } & React.HtmlHTMLAttributes<HTMLDivElement>,
    ref,
  ) => {
    const editor = useSlateStatic();
    const [activeIdx, setActiveIdx] = React.useState(0);

    const { insertInfo } = useEditorRuntime();
    const { searchItems } = insertInfo;
    const element = React.useMemo(
      () => Node.parent(editor, path),
      [editor, path],
    );
    const insertItems = React.useMemo(
      () => searchItems(search),
      [searchItems, search],
    );
    const bgColorItems = React.useMemo(
      () =>
        editor.isBgColorable(element) ? searchColor(search, bgColorInfo) : [],
      [search, element],
    );
    const txtColorItems = React.useMemo(
      () =>
        editor.isTxtColorable(element) ? searchColor(search, txtColorInfo) : [],
      [search, element],
    );
    // const items = React.useMemo<any>(
    //   () => insertItems.concat(bgColorItems, txtColorItems),
    //   [insertItems, bgColorItems, txtColorItems],
    // );
    const bgColorStartIdx = insertItems.length;
    const txtColorItemsStartIdx = bgColorStartIdx + bgColorItems.length;
    const totalLength = txtColorItemsStartIdx + txtColorItems.length;
    React.useEffect(() => {
      setActiveIdx(0);
    }, [search]);
    const counterRef = React.useRef<number>(0);
    React.useEffect(() => {
      if (totalLength !== 0) {
        counterRef.current = 0;
        return;
      } else {
        ++counterRef.current;
      }
      if (counterRef.current > 7) emptyPath();
    }, [search]);
    const enterRef = React.useRef<any>(null);
    enterRef.current = handleClick;
    React.useImperativeHandle(
      ref,
      () => ({
        up: () =>
          setActiveIdx((prev) => (prev === 0 ? totalLength - 1 : --prev)),
        down: () =>
          setActiveIdx((prev) => (prev === totalLength - 1 ? 0 : ++prev)),
        enter: () => enterRef.current?.(),
      }),
      [totalLength],
    );

    // console.log('search', items);

    return (
      <div className="lla-insert" {...others}>
        {totalLength === 0 && <div>没有对应结果</div>}
        {insertItems.length !== 0 && (
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">基础元素</div>
            {insertItems.map(({ title, description }, i) => (
              <InsertPannelItem
                active={i === activeIdx}
                imgSrc="https://www.notion.so/images/blocks/text.9fdb530b.png"
                title={title}
                description={description}
                key={i}
                onMouseOver={() => setActiveIdx(i)}
                onClick={handleClick}
              ></InsertPannelItem>
            ))}
          </div>
        )}
        {bgColorItems.length !== 0 && (
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">背景颜色</div>
            {bgColorItems.map(({ title, value }, i) => (
              <ColorItem
                color={value}
                active={i + bgColorStartIdx === activeIdx}
                title={title}
                description={`将背景设为${title}`}
                key={i}
                onMouseOver={() => setActiveIdx(i + bgColorStartIdx)}
                onClick={handleClick}
              ></ColorItem>
            ))}
          </div>
        )}
        {txtColorItems.length !== 0 && (
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">文字</div>
            {txtColorItems.map(({ title, value }, i) => (
              <ColorItem
                color={value}
                active={i + txtColorItemsStartIdx === activeIdx}
                title={title}
                description={`将文字设为${title}`}
                key={i}
                onMouseOver={() => setActiveIdx(i + txtColorItemsStartIdx)}
                onClick={handleClick}
              ></ColorItem>
            ))}
          </div>
        )}
      </div>
    );

    function handleClick() {
      if (totalLength === 0) return;
      if (activeIdx < bgColorStartIdx) return handleClick_i();
      if (activeIdx < txtColorItemsStartIdx) return handleClick_bg();
      console.log('hhh');
      return handleClick_txt();
    }

    function handleClick_i() {
      const [parent, parentPath] = Editor.parent(editor, path);
      const { create } = insertItems[activeIdx];
      emptyPath();
      if (
        parent.children.length > 1 ||
        (LLAElement.is(parent) && parent.type !== 'text-block')
      ) {
        //存在缩进
        return Editor.withoutNormalizing(editor, () => {
          Transforms.delete(editor, { reverse: true });
          Transforms.insertNodes(editor, create(editor), {
            at: Path.next(parentPath),
          });
          return Transforms.select(
            editor,
            Editor.start(editor, Path.next(parentPath)),
          );
        });
      }
      //将当前text-block删除
      return Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: parentPath });
        Transforms.insertNodes(editor, create(editor), { at: parentPath });
        return Transforms.select(editor, Editor.start(editor, parentPath));
      });
    }
    function handleClick_bg() {
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, editor.createParagraph(''), {
          at: path,
        });
        Transforms.setNodes(
          editor,
          { bgColor: bgColorItems[activeIdx - bgColorStartIdx].value } as any,
          { at: Path.parent(path) },
        );
        return Transforms.select(editor, Editor.start(editor, path));
      });

      emptyPath();
    }
    function handleClick_txt() {
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, editor.createParagraph(''), {
          at: path,
        });
        Transforms.setNodes(
          editor,
          {
            txtColor: txtColorItems[activeIdx - txtColorItemsStartIdx].value,
          } as any,
          { at: Path.parent(path) },
        );
        return Transforms.select(editor, Editor.start(editor, path));
      });
      emptyPath();
    }
  },
);
