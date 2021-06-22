import { Range, Node, Editor, Point, Transforms, Path } from 'slate';
import { caseMatch, OnParagraphConvert, shotkey } from '@lla-editor/core';
import { HeadingElement } from './element';

const headingReg = /^(#+)/;

const handleSpace: OnParagraphConvert = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  const [parentNode, parentPath] = Editor.parent(editor, path);
  if (Editor.isEditor(parentNode)) return next();
  const str = Node.string(node);
  const result = headingReg.exec(str);
  if (!result) return next();
  const headingLevel = result[1].length;
  if (headingLevel > 3) return next();
  if (HeadingElement.is(parentNode)) {
    if (parentNode.level === headingLevel) return next();
    event.preventDefault();
    Transforms.delete(editor, { reverse: true, distance: headingLevel });
    return Transforms.setNodes(
      editor,
      { level: headingLevel as any },
      { at: parentPath },
    );
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
      Object.assign(HeadingElement.create(editor, headingLevel as any), {
        children: [editor.createParagraph(str.slice(headingLevel))],
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
