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
        domAlign(ref.current, dom, { points: ['tl', 'bl'] });
      }
    }, [path]);

    return (
      <div
        className="lla-overlay w-screen h-screen z-50 bg-transparent fixed top-0 left-0"
        onClick={emptyPath}
      >
        <div
          ref={ref}
          // className="contents"
          onClick={(e) => e.stopPropagation()}
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
    const items = React.useMemo(
      () => searchItems(search),
      [searchItems, search],
    );
    React.useEffect(() => {
      setActiveIdx(0);
    }, [items]);
    const counterRef = React.useRef<number>(0);
    React.useEffect(() => {
      if (items.length !== 0) {
        counterRef.current = 0;
        return;
      } else {
        ++counterRef.current;
      }
      if (counterRef.current > 7) emptyPath();
    }, [items]);
    const enterRef = React.useRef<any>(null);
    enterRef.current = handleClick;
    React.useImperativeHandle(
      ref,
      () => ({
        up: () =>
          setActiveIdx((prev) => (prev === 0 ? items.length - 1 : --prev)),
        down: () =>
          setActiveIdx((prev) => (prev === items.length - 1 ? 0 : ++prev)),
        enter: () => enterRef.current?.(),
      }),
      [items],
    );

    console.log('search', items);

    return (
      <div className="lla-insert" {...others}>
        {items.length === 0 && <div>没有对应结果</div>}
        {items.length !== 0 && (
          <div className="lla-insert__group">
            <div className="lla-insert__group-label">基础元素</div>
            {items.map(({ title, description }, i) => (
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
      </div>
    );

    function handleClick() {
      if (items.length === 0) return;
      const [parent, parentPath] = Editor.parent(editor, path);
      const { create } = items[activeIdx];
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
  },
);
