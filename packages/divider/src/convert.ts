import { Range, Node, Editor, Point, Transforms } from 'slate';
import {
  caseMatch,
  Deserialize,
  groupKeyDown,
  OnParagraphConvert,
  Serialize,
  shotkey,
} from '@lla-editor/core';
import { DividerElement } from './element';

const dividerReg = /^--/;

const handleShotBar: OnParagraphConvert = (
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
  if (dividerReg.test(text)) {
    event.preventDefault();
    //将当前父节点删除并添加空白的image
    return Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: parentPath });
      Transforms.insertNodes(editor, DividerElement.create(), {
        at: parentPath,
      });
      Transforms.select(editor, Editor.start(editor, parentPath));
    });
  }
};

export const onParagraphConvert: OnParagraphConvert = (...args) => {
  return caseMatch<Parameters<OnParagraphConvert>>()<void>(
    [shotkey('-'), handleShotBar],
    [(...args) => args, (next) => next()],
  )(...args);
};

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'thematicBreak') {
    return acc.concat(DividerElement.create());
  }
  return next();
};

export const serialize: Serialize = (next, ele, editor) => {
  if (DividerElement.is(ele)) {
    return { type: 'thematicBreak' };
  }
  return next();
};
