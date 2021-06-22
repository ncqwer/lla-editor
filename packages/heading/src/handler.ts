import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import { Editor, Path, Point, Range, Text, Transforms } from 'slate';
import { HeadingElement } from './element';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (HeadingElement.is(node)) return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<HeadingElement>;

const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  event.preventDefault();
  const [start, end] = Range.edges(selection);
  const textEnd = Editor.end(editor, path);
  let remainStr = '';
  let range: Range | null = null;
  const text = (node.children[0] as any).children[0] as Text;
  if (Point.isBefore(end, textEnd)) {
    // 文本没有完全删除
    remainStr = text.text.slice(end.offset);
    range = { anchor: start, focus: textEnd };
  } else {
    // 没有剩余文本
    range = selection;
  }
  return Editor.withoutNormalizing(editor, () => {
    if (range && Range.isExpanded(range))
      Transforms.delete(editor, { at: range });
    const nextPath = Path.next(path);
    Transforms.insertNodes(editor, editor.createParagraph(remainStr), {
      at: nextPath,
    });
    Transforms.select(editor, Editor.start(editor, nextPath));
  });
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('enter'), handleEnter],
  [(...args) => args, (next) => next()],
);
