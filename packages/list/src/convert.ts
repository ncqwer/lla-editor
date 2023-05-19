import {
  Range,
  Node,
  Editor,
  // Point,
  Transforms,
} from 'slate';
import {
  caseMatch,
  // groupKeyDown,
  OnParagraphConvert,
  shotkey,
  Deserialize,
  Serialize,
} from '@lla-editor/core';
import { List } from './element';

const bulletedReg = /^-/;
const numberedReg = /^1\./;

const handleSpace: OnParagraphConvert = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (!editor.isContainable(parentNode)) return next();
  const text = Node.string(node);
  if (bulletedReg.test(text)) {
    if (List.isBulleted(parentNode)) return next();
    const [start, end] = Range.edges(selection);
    if (start.offset !== 1) return next();
    event.preventDefault();
    // 将当前父节点转化为BulletedListItem
    return Editor.withoutNormalizing(editor, () => {
      if (end.offset !== 0)
        Transforms.delete(editor, {
          at: end,
          reverse: true,
          distance: end.offset,
        });
      Transforms.wrapNodes(editor, List.createBulleted(editor), {
        at: parentPath,
      });
      Transforms.unwrapNodes(editor, { at: parentPath.concat(0) });
    });
  }
  if (numberedReg.test(text)) {
    if (List.isNumbered(parentNode)) return next();
    const [start, end] = Range.edges(selection);
    if (start.offset !== 2) return next();
    // 将当前父节点转化为NumberedListItem
    event.preventDefault();
    return Editor.withoutNormalizing(editor, () => {
      if (end.offset !== 0)
        Transforms.delete(editor, {
          at: end,
          reverse: true,
          distance: end.offset,
        });
      Transforms.wrapNodes(editor, List.createNumbered(editor), {
        at: parentPath,
      });
      Transforms.unwrapNodes(editor, { at: parentPath.concat(0) });
    });
  }
  return next();
};

const taskReg = /^[\[【]/;
const handleSquareBrackets: OnParagraphConvert = (
  next,
  event,
  editor,
  [node, path],
) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (List.isTask(parentNode)) return next();
  if (!editor.isContainable(parentNode)) return next();
  const text = Node.string(node);
  if (taskReg.test(text)) {
    const [start, end] = Range.edges(selection);
    if (start.offset !== 1) return next();
    event.preventDefault();
    // 将当前父节点转化为BulletedListItem
    return Editor.withoutNormalizing(editor, () => {
      if (end.offset !== 0)
        Transforms.delete(editor, {
          at: end,
          reverse: true,
          distance: end.offset,
        });
      Transforms.wrapNodes(editor, List.createTask(editor), { at: parentPath });
      Transforms.unwrapNodes(editor, { at: parentPath.concat(0) });
    });
  }
  return next();
};

export const onParagraphConvert: OnParagraphConvert = (...args) => {
  return caseMatch<Parameters<OnParagraphConvert>>()<void>(
    [shotkey('space'), handleSpace],
    [shotkey(']'), handleSquareBrackets],
    // [shotkey('】'), handleSquareBrackets_chinese],
    [(...args) => args, (next) => next()],
  )(...args);
};

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'list') {
    const listItems = ast.children.reduce(
      (ac: any, v: any) => editor.deserialize(v, editor, ac),
      [],
    );
    return acc.concat(
      listItems.map((v: any) => ({
        ...(ast.ordered
          ? List.createNumbered(editor)
          : List.createBulleted(editor)),
        ...v,
      })),
    );
  }
  if (ast.type === 'listItem') {
    return acc.concat({
      children: ast.children.reduce(
        (ac: any, v: any) => editor.deserialize(v, editor, ac),
        [],
      ),
    });
  }
  return next();
};

export const serialize: Serialize = (next, node, editor) => {
  if (List.isBulleted(node) || List.isTask(node) || List.isNumbered(node)) {
    return {
      type: 'listItem',
      children: node.children
        .map((v) => editor.serialize(v, editor))
        .filter(Boolean),
    };
  }
  return next();
};
