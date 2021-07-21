import React from 'react';
import { BaseElement, Text, Node, Editor, Range, Transforms } from 'slate';
import { RenderLeafProps, useSelected, useSlateStatic } from 'slate-react';
import {
  Deserialize,
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  ExtendRenderLeafProps,
  groupKeyDown,
  LeafJSX,
  OnKeyDownResponseZone,
  OnKeyDownType,
  Serialize,
  shotkey,
  textPropsIs,
} from '../rules';
import { LLAElement, BaseParagraph, StyledText } from '../type';

const _TYPE_ = 'paragraph';

export const Paragraph = {
  is: (node: Node): node is BaseParagraph =>
    LLAElement.is(node) && node.type === _TYPE_,
  isStyleText: (text: Node): text is StyledText =>
    Text.isText(text) &&
    (!!text.italic ||
      !!text.bold ||
      !!text.lineThrough ||
      !!text.bgColor ||
      !!text.underline ||
      !!text.txtColor),
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
      if (text.text.length === 0 && element.children.length === 1) {
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

const renderLeaf = [
  [
    textPropsIs(Paragraph.isStyleText),
    ({ leaf, attributes, children }: ExtendRenderLeafProps<StyledText>) => {
      const array: string[] = [];
      if (leaf.bgColor) array.push(leaf.bgColor);
      if (leaf.txtColor) array.push(leaf.txtColor);
      if (leaf.bold) array.push('font-bold');
      if (leaf.italic) array.push('italic');
      if (leaf.lineThrough) array.push('line-through');
      if (leaf.underline) array.push('underline');
      const cls = array.join(' ');
      if (leaf.inlineCode)
        return (
          <code {...attributes} className={`lla-inline-code ${cls}`}>
            {children}
          </code>
        );
      return (
        <span {...attributes} className={cls}>
          {children}
        </span>
      );
    },
  ],
] as LeafJSX<StyledText>;

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
// const isMobileSlash = <T extends any[]>(...args: T): T | undefined => {
//   const event = args[1] as React.KeyboardEvent;
//   if (event.keyCode === 229 && event.key === 'Slash') return args;
//   return undefined;
// };
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
  // if (text.length !== 0) return next();
  //现在 我们在空白的paragraph上了
  const insert = editor.getOvlerLayer('insert');
  insert?.open?.([path, text.length]);
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

const handleEsc: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  insert.close();
  event.preventDefault();
};

const handleEnter: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (!insert) return next();
  if (insert.isEmpty()) return next();
  event.preventDefault();
  insert.enter();
};

const handleShiftEnter: KeyDown = (next, event, editor) => {
  const insert = editor.getOvlerLayer('insert');
  if (insert && !insert.isEmpty()) {
    event.preventDefault();
    insert.enter();
    return;
  }
  // soft换行
  event.preventDefault();
  Transforms.insertText(editor, '\n');
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('/'), handleSlash],
  // [isMobileSlash, handleSlash],
  [shotkey('backspace'), handleBackspace],
  [shotkey('up'), handleUp],
  [shotkey('ctrl+p'), handleUp],
  [shotkey('down'), handleDown],
  [shotkey('ctrl+n'), handleDown],
  [shotkey('shift+enter'), handleShiftEnter],
  [shotkey('enter'), handleEnter],
  [shotkey('tab'), handleTab],
  [shotkey('esc'), handleEsc],
  [isControlKey, handleConvert],
  [(...args) => args, (next) => next()],
);

const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'paragraph') {
    const children = ast.children.reduce(
      (ac: Node[], v: any) => editor.deserialize(v, editor, ac),
      [],
    );
    return acc.concat(
      Object.assign({}, editor.createParagraph(''), { children }),
    );
  }
  if (ast.type === 'strong') {
    if (!ast.children) return acc.concat({ text: ast.value, bold: true });
    return acc.concat(
      ast.children
        .reduce((ac: Node[], v: any) => editor.deserialize(v, editor, ac), [])
        .map((v: any) => ({ ...v, bold: true })),
    );
  }
  if (ast.type === 'text') {
    if (!ast.children) return acc.concat({ text: ast.value });
    return acc.concat(
      ast.children.reduce(
        (ac: Node[], v: any) => editor.deserialize(v, editor, ac),
        [],
      ),
    );
  }
  if (ast.type === 'emphasis') {
    if (!ast.children) return acc.concat({ text: ast.value, italic: true });
    return acc.concat(
      ast.children
        .reduce((ac: Node[], v: any) => editor.deserialize(v, editor, ac), [])
        .map((v: any) => ({ ...v, italic: true })),
    );
  }
  if (ast.type === 'delete') {
    if (!ast.children)
      return acc.concat({ text: ast.value, lineThrough: true });
    return acc.concat(
      ast.children
        .reduce((ac: Node[], v: any) => editor.deserialize(v, editor, ac), [])
        .map((v: any) => ({ ...v, lineThrough: true })),
    );
  }
  if (ast.type === 'inlineCode') {
    if (!ast.children) return acc.concat({ text: ast.value, inlineCode: true });
    return acc.concat(
      ast.children
        .reduce((ac: Node[], v: any) => editor.deserialize(v, editor, ac), [])
        .map((v: any) => ({ ...v, inlineCode: true })),
    );
  }
  return next();
};

const serialize: Serialize = (next, node, editor) => {
  if (Paragraph.is(node)) {
    return {
      type: 'paragraph',
      children: node.children
        .map((v) => editor.serialize(v, editor))
        .filter(Boolean),
    };
  }
  if (Text.isText(node)) {
    if (node.inlineCode)
      return {
        children: [{ value: node.text, type: 'text' }],
        type: 'inlineCode',
      };
    if (node.bold)
      return {
        children: [{ value: node.text, type: 'text' }],
        type: 'strong',
      };
    if (node.italic)
      return {
        children: [{ value: node.text, type: 'text' }],
        type: 'emphasis',
      };
    return { value: node.text, type: 'text' };
  }
  return next();
};

export default {
  pluginName: 'paragraph',
  renderElement: render,
  renderLeaf,
  deserialize,
  serialize,
  onKeyDownResponseZone,
};
