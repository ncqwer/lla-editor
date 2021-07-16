import { Range, Node, Editor, Point, Transforms } from 'slate';
import {
  caseMatch,
  Deserialize,
  groupKeyDown,
  OnParagraphConvert,
  Serialize,
  shotkey,
} from '@lla-editor/core';
import { ImageElement } from './element';

const imageReg = /^!\[/;

const handleSquareBrackets: OnParagraphConvert = (
  next,
  event,
  editor,
  [node, path],
) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (parentNode.children.length > 1) return next();
  const text = Node.string(node);
  if (imageReg.test(text)) {
    event.preventDefault();
    //将当前父节点删除并添加空白的image
    return Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: parentPath });
      Transforms.insertNodes(editor, ImageElement.create(), { at: parentPath });
    });
  }
};

export const onParagraphConvert: OnParagraphConvert = (...args) => {
  return caseMatch<Parameters<OnParagraphConvert>>()<void>(
    [shotkey(']'), handleSquareBrackets],
    [(...args) => args, (next) => next()],
  )(...args);
};

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'image') {
    return acc.concat({ ...ImageElement.create(), src: ast.url, alt: ast.alt });
  }
  return next();
};

export const serialize: Serialize = (next, ele, editor) => {
  if (ImageElement.is(ele) && ele.src && typeof ele.src === 'string')
    return { type: 'image', url: ele.src, alt: ele.alt };
  return next();
};
