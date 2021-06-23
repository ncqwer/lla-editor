import {
  caseMatch,
  groupKeyDown,
  OnKeyDownAlternative,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import { Path, Transforms, Editor, Range, Node } from 'slate';

import { ImageElement } from './element';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (ImageElement.is(node)) return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<ImageElement>;

const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
  event.preventDefault();
  Transforms.insertNodes(editor, editor.createParagraph(''), {
    at: Path.next(path),
  });
  Transforms.select(editor, Editor.start(editor, Path.next(path)));
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('enter'), handleEnter],
  // [shotkey('backspace'), handleBackspace],
  [(...args) => args, (next) => next()],
);
/**
 * readme: 当前方法为作用于所有的void(计划独立到单独的包中)
 *
 * @param next
 * @param event
 * @param editor
 * @returns
 */
const handleBackspace_a: OnKeyDownAlternative = (next, event, editor) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  const start = selection.anchor;
  if (start.offset !== 0) return next();
  const previousPoint = Editor.before(editor, start);
  if (!previousPoint) return next();
  let path = previousPoint.path.slice(0, -1);
  let element = Node.get(editor, path);
  let flag = false;
  while (Editor.isVoid(editor, element) && path[path.length - 1] > 0) {
    flag = true;
    path = Path.previous(path);
    element = Node.get(editor, path);
  }
  // if (ImageElement.is(element)) {
  if (flag) {
    // event.preventDefault();
    return Transforms.moveNodes(editor, {
      at: start.path.slice(0, -2),
      to: Path.next(path),
    });
  }
  return next();
};

export const onKeyDownAlternative: OnKeyDownAlternative = (...args) => {
  return caseMatch<Parameters<OnKeyDownAlternative>>()(
    [shotkey('backspace'), handleBackspace_a],
    [(...args) => args, (next) => next()],
  )(...args);
};
