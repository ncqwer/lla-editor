import { Range, Node, Editor, Point, Transforms, Path } from 'slate';
import {
  caseMatch,
  OnParagraphConvert,
  shotkey,
  Deserialize,
  Serialize,
} from '@lla-editor/core';
import { IndentContainer } from '@lla-editor/indent';
import { QuoteElement } from './element';

const quoteReg = /^>/;

const handleSpace: OnParagraphConvert = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (Editor.isEditor(parentNode)) return next();
  const str = Node.string(node);
  if (!quoteReg.test(str)) return next();

  if (QuoteElement.is(parentNode)) {
    return next();
  }
  event.preventDefault();
  if (editor.isContainable(parentNode) && parentNode.children.length > 1) {
    //当前为可能包含IndentContainer
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
    Transforms.insertNodes(
      editor,
      Object.assign(QuoteElement.create(editor), {
        children: [editor.createParagraph(str.slice(1))], //这里假定paragraph仅仅有一个text
      }),
      { at: parentPath },
    );
    Transforms.select(editor, Editor.start(editor, parentPath));
  });
};

export const onParagraphConvert: OnParagraphConvert = (...args) => {
  return caseMatch<Parameters<OnParagraphConvert>>()<void>(
    [shotkey('space'), handleSpace],
    // [shotkey('】'), handleSquareBrackets_chinese],
    [(...args) => args, (next) => next()],
  )(...args);
};

const quoteDeReg = /^>/;
export const deserialize: Deserialize = (next, str, editor) => {
  if (quoteDeReg.exec(str))
    return {
      ...QuoteElement.create(editor),
      children: [editor.createParagraph(str.slice(1))],
    };
  return next();
};

export const serialize: Serialize = (next, ele, editor) => {
  if (QuoteElement.is(ele)) return `>${Node.string(ele)}`;
  return next();
};
