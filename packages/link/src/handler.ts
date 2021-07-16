import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import { Editor, Node, Path, Point, Range, Text, Transforms } from 'slate';
import { LinkElement } from './element';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (LinkElement.is(node)) return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<LinkElement>;

const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  event.preventDefault();
  window.location.href = node.url;
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('enter'), handleEnter],
  [shotkey('shift+enter'), handleEnter],
  [(...args) => args, (next) => next()],
);
