import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import { Editor, Path, Point, Range, Text, Transforms, Node } from 'slate';
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
  // let remainStr = '';
  // let range: Range | null = null;
  // const text = (node.children[0] as any).children[0] as Text;

  const moveRangeRef = Point.isBefore(end, textEnd)
    ? Editor.rangeRef(editor, { anchor: end, focus: textEnd })
    : null;
  return Editor.withoutNormalizing(editor, () => {
    Transforms.splitNodes(editor, { at: selection });
    const ran = moveRangeRef?.unref();
    if (ran) {
      let [start, end] = Editor.edges(editor, ran);
      if ((Node.get(editor, start.path) as Text).text.length === start.offset) {
        const ne = Editor.next(editor, { at: start.path, match: Text.isText });
        if (!ne) return;
        start = { path: ne[1], offset: 0 };
      }

      Transforms.moveNodes(editor, {
        at: { anchor: start, focus: end },
        to: Path.next(path),
        // mode: 'highest',
      });
    } else {
      Transforms.insertNodes(editor, editor.createParagraph(''), {
        at: Path.next(path),
      });
    }
    Transforms.select(editor, Editor.start(editor, Path.next(path)));
    // const nextPath = Path.next(path);
    // Transforms.insertNodes(editor, editor.createParagraph(remainStr), {
    //   at: nextPath,
    // });
    // Transforms.select(editor, Editor.start(editor, nextPath));
  });
};

// const handleEnter: KeyDown = (next, event, editor, [node, path]) => {
//   const { selection } = editor;
//   if (!selection) return next();
//   event.preventDefault();
//   const [start, end] = Range.edges(selection);
//   const textEnd = Editor.end(editor, path);
//   let remainStr = '';
//   let range: Range | null = null;
//   const text = (node.children[0] as any).children[0] as Text;
//   if (Point.isBefore(end, textEnd)) {
//     // 文本没有完全删除
//     remainStr = text.text.slice(end.offset);
//     range = { anchor: start, focus: textEnd };
//   } else {
//     // 没有剩余文本
//     range = selection;
//   }
//   return Editor.withoutNormalizing(editor, () => {
//     if (range && Range.isExpanded(range))
//       Transforms.delete(editor, { at: range });
//     const nextPath = Path.next(path);
//     Transforms.insertNodes(editor, editor.createParagraph(remainStr), {
//       at: nextPath,
//     });
//     Transforms.select(editor, Editor.start(editor, nextPath));
//   });
// };

const handleBackspace: KeyDown = (next, event, editor, [node, path]) => {
  const { selection } = editor;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  const start = selection.focus;
  const nodeStart = Editor.start(editor, path);
  if (!Point.equals(start, nodeStart)) return next();
  event.preventDefault();
  return Transforms.unwrapNodes(editor, { at: path });
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('enter'), handleEnter],
  [shotkey('shift+enter'), handleEnter],
  [shotkey('backspace'), handleBackspace],
  [(...args) => args, (next) => next()],
);
