import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';

import {
  Editor,
  Range,
  Transforms,
  // Point, Text, Path
} from 'slate';
import {
  BulletedListItem,
  List,
  NumberedListItem,
  TaskListItem,
} from './element';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (List.isTask(node) || List.isBulleted(node) || List.isNumbered(node))
    return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<
  TaskListItem | BulletedListItem | NumberedListItem
>;

// const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
//   const { selection } = editor;
//   if (!selection) return next();
//   const [start, end] = Range.edges(selection);
//   const textEnd = Editor.end(editor, path.concat(0));
//   let remainStr = '';
//   let range: Range | null = null;
//   const text = node.children[0].children[0] as any as Text;
//   if (Point.isBefore(end, textEnd)) {
//     // 文本没有完全删除
//     remainStr = text.text.slice(end.offset);
//     range = { anchor: start, focus: textEnd };
//   } else {
//     // 没有剩余文本
//     range = selection;
//   }
//   let newPath: Path;
//   let newBlock: any;
//   if (node.children[1]) {
//     // 当前文本有缩进行
//     newPath = path.concat(1, 0);
//     newBlock = Object.assign({}, node.children[1].children[0], {
//       children: [editor.createParagraph(remainStr)],
//     });
//   } else {
//     newPath = Path.next(path);
//     newBlock = Object.assign({}, node, {
//       children: [editor.createParagraph(remainStr)],
//     });
//   }
//   event.preventDefault();
//   return Editor.withoutNormalizing(editor, () => {
//     if (range && Range.isExpanded(range))
//       Transforms.delete(editor, { at: range });
//     Transforms.insertNodes(editor, newBlock, { at: newPath });
//     Transforms.select(editor, Editor.start(editor, newPath));
//   });
// };

const handleBackspace: KeyDown = (next, event, editor, [, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  if (selection.anchor.offset !== 0) return next();
  event.preventDefault();
  return Editor.withoutNormalizing(editor, () => {
    // Transforms.wrapNodes(
    //   editor,
    //   { type: 'text-block', children: [] },
    //   { at: path },
    // );
    Transforms.unwrapNodes(editor, { at: path });
  });
};

const handleKeyDown = groupKeyDown<KeyDown>(
  // [shotkey('enter'), handleEnter],
  [shotkey('backspace'), handleBackspace],
  [(...args) => args, (next) => next()],
);
