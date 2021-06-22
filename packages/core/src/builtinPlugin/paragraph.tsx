import React from 'react';
import { BaseElement, Text, Node, Editor, Range } from 'slate';
import { useSelected, useSlateStatic } from 'slate-react';
import {
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '../rules';
import { LLAElement, BaseParagraph } from '../type';

const _TYPE_ = 'paragraph';

const Paragraph = {
  is: (node: Node): node is BaseParagraph =>
    LLAElement.is(node) && node.type === _TYPE_,
};

export const PlaceholderContext =
  React.createContext<string>("键入'/'获得帮助");

const render = [
  [
    elementPropsIs(Paragraph.is),
    elementRender((props) => {
      const { attributes, children: _children, element } = props;
      let children = _children;
      const editor = useSlateStatic();
      const selected = useSelected();
      const Tag = editor.isInline(element) ? 'span' : 'p';
      const text = element.children[0] as Text;
      const placeholder = React.useContext(PlaceholderContext);
      if (text.text.length === 0) {
        children = (
          <>
            <span className="lla-placeholder " contentEditable={false}>
              {placeholder}
            </span>
            {_children}
          </>
        );
      }
      return (
        <Tag
          {...attributes}
          className={`lla-paragraph ${selected ? 'lla-selected' : ''}`}
        >
          {children}
        </Tag>
      );
    }),
  ],
] as ElementJSX<BaseParagraph>;

const onKeyDownResponseZone: OnKeyDownResponseZone = (next, [node, path]) => {
  if (Paragraph.is(node)) return handleKeyDown([node, path]);
  return next();
};

const controlKeyReg = /[^1-9a-zA-Z]/;
const isControlKey = <T extends any[]>(...args: T): T | undefined => {
  const event = args[1] as React.KeyboardEvent;
  if (
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    controlKeyReg.test(event.key)
  )
    return args;
  return undefined;
};
type KeyDown = OnKeyDownType<BaseParagraph>;

const handleConvert: KeyDown = (next, event, editor, entry) => {
  return editor.convertFromParagraph(next, event, editor, entry);
};

const handleSlash: KeyDown = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  const start = selection.anchor;
  if (start.offset !== 0) return next();
  const text = Node.string(node);
  if (text.length !== 0) return next();
  //现在 我们在空白的paragraph上了
  const insert = editor.getOvlerLayer('insert');
  insert?.open?.(path);
};

const handleBackspace: KeyDown = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  const start = selection.anchor;
  if (start.offset !== 1) return next();
  const text = Node.string(node);
  if (text.length !== 1) return next();
  const insert = editor.getOvlerLayer('insert');
  insert?.close?.();
};

const handleUp: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  event.preventDefault();
  insert.up();
};

const handleDown: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  event.preventDefault();
  insert.down();
};

const handleTab: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  insert.close();
  return next();
};

const handleEnter: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  event.preventDefault();
  insert.enter();
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('/'), handleSlash],
  // [shotkey('/'), handleSlash],
  [shotkey('backspace'), handleBackspace],
  [shotkey('up'), handleUp],
  [shotkey('ctrl+p'), handleUp],
  [shotkey('down'), handleDown],
  [shotkey('ctrl+n'), handleDown],
  [shotkey('enter'), handleEnter],
  [shotkey('tab'), handleTab],
  [isControlKey, handleConvert],
  [(...args) => args, (next) => next()],
);

export default {
  pluginName: 'paragraph',
  renderElement: render,
  onKeyDownResponseZone,
};
