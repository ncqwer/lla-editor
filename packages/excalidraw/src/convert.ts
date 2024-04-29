import { Node, Editor, Transforms } from 'slate';
import {
  caseMatch,
  Deserialize,
  OnParagraphConvert,
  Serialize,
  shotkey,
} from '@lla-editor/core';
import { ExcalidrawElement, _TYPE_ } from './element';

const ExcalidrawReg = /^!\[/;

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
  if (ExcalidrawReg.test(text)) {
    event.preventDefault();
    // 将当前父节点删除并添加空白的Excalidraw
    return Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: parentPath });
      Transforms.insertNodes(editor, ExcalidrawElement.create(), {
        at: parentPath,
      });
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
  // if (ast.type === _TYPE_) {
  //   return acc.concat({
  //     ...ExcalidrawElement.create(),
  //     src: ast.url,
  //     alt: ast.alt,
  //   });
  // }
  return next();
};

export const serialize: Serialize = (next, ele) => {
  // if (ExcalidrawElement.is(ele) && ele.src && typeof ele.src === 'string')
  //   return { type: _TYPE_, url: ele.src, alt: ele.alt };
  return next();
};
