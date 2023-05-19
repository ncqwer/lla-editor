import { Node, Editor, Transforms, Path } from 'slate';
import {
  caseMatch,
  Deserialize,
  OnParagraphConvert,
  Serialize,
  shotkey,
} from '@lla-editor/core';
import { Code } from './element';
import { availableLanguage } from './render';

const codeReg = /^``$/;

const handleSpace: OnParagraphConvert = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (Editor.isEditor(parentNode)) return next();
  const str = Node.string(node);
  if (!codeReg.test(str)) return next();
  event.preventDefault();
  if (editor.isContainable(parentNode) && parentNode.children.length > 1) {
    // 当前为可能包含IndentContainer
    Editor.withoutNormalizing(editor, () => {
      Transforms.moveNodes(editor, {
        at: parentPath.concat(1),
        to: Path.next(parentPath),
      });
      Transforms.unwrapNodes(editor, { at: Path.next(parentPath) });
    });
  }
  return Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: parentPath });
    Transforms.insertNodes(editor, Code.createCodeBlock(), { at: parentPath });
    Transforms.select(editor, Editor.start(editor, parentPath));
  });
};

export const onParagraphConvert: OnParagraphConvert = (...args) => {
  return caseMatch<Parameters<OnParagraphConvert>>()<void>(
    [shotkey('`'), handleSpace],
    [(...args) => args, (next) => next()],
  )(...args);
};

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'code') {
    const language =
      Object.entries(availableLanguage).find(([, { test }]) =>
        test(ast.lang),
      )?.[0] || 'javascript';
    const item = {
      ...Code.createCodeBlock(),
      language,
      children: (ast.value as string)
        .split('\n')
        .map((v) => Code.createCodeLine(v)),
    };
    return acc.concat(item);
  }
  return next();
};

export const serialize: Serialize = (next, ele) => {
  if (Code.isCode(ele)) {
    return {
      type: 'code',
      lang: ele.language,
      value: ele.children.map((codeline) => Node.string(codeline)).join('\n'),
    };
  }
  if (Code.isCodeLine(ele)) {
    return {
      type: 'paragraph',
      children: [{ type: 'text', value: Node.string(ele) }],
    };
  }
  return next();
};
