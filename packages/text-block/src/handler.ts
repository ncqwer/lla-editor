import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  // shotkey,
} from '@lla-editor/core';
// import { Range, Transforms, Text, Editor, Point, Path } from 'slate';
import { TextBlock } from './element';

type KeyDown = OnKeyDownType<TextBlock>;

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (TextBlock.is(node)) return handleKeyDown([node, path]);
  return next();
};

// /**
//  * 请注意TextBlock作为containalbe，目前仅有两种形态：
//  * - children.lenght === 1 && children[0] is paragraph
//  * - children.length === 2 &&
//  *   children[0] is paragraph
//  *   children[1] is indentContainer
//  * readme: 目前手动维护这个状态
//  */
// const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
//   const { selection } = editor;
//   if (!selection) return next();
//   const [start, end] = Range.edges(selection);
//   const textEnd = Editor.end(editor, path.concat(0));
//   let remainStr = '';
//   let range: Range | null = null;
//   const text = node.children[0].children[0] as Text;
//   if (Point.isBefore(end, textEnd)) {
//     // 文本没有完全删除
//     remainStr = text.text.slice(end.offset);
//     range = { anchor: start, focus: textEnd };
//   } else {
//     // 没有剩余文本
//     range = selection;
//   }
//   let newPath: Path;
//   if (node.children[1]) {
//     // 当前文本有缩进行
//     newPath = path.concat(1, 0);
//   } else {
//     newPath = Path.next(path);
//   }
//   event.preventDefault();
//   return Editor.withoutNormalizing(editor, () => {
//     if (range && Range.isExpanded(range))
//       Transforms.delete(editor, { at: range });
//     const newTextBlock = TextBlock.create();
//     newTextBlock.children.push(editor.createParagraph(remainStr));
//     Transforms.insertNodes(editor, newTextBlock, { at: newPath });
//     Transforms.select(editor, Editor.start(editor, newPath));
//   });
// };

const handleKeyDown = groupKeyDown<KeyDown>(
  // [shotkey('enter'), handleEnter],
  [(...args) => args, (next) => next()],
);
