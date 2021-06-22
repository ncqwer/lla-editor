import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import { Path, Transforms, Editor } from 'slate';

import { DividerElement } from './element';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (DividerElement.is(node)) return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<DividerElement>;

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
