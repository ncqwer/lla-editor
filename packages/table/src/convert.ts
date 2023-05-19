import { Deserialize, Serialize } from '@lla-editor/core';
import { Table } from './element';

// const imageReg = /^!\[/;

// const handleSquareBrackets: OnParagraphConvert = (
//   next,
//   event,
//   editor,
//   [node, path],
// ) => {
//   const { selection } = editor;
//   if (!selection) return next();
//   const [parentNode, parentPath] = Editor.parent(editor, path);
//   if (parentNode.children.length > 1) return next();
//   const text = Node.string(node);
//   if (imageReg.test(text)) {
//     event.preventDefault();
//     //将当前父节点删除并添加空白的image
//     return Editor.withoutNormalizing(editor, () => {
//       Transforms.removeNodes(editor, { at: parentPath });
//       Transforms.insertNodes(editor, ImageElement.create(), { at: parentPath });
//     });
//   }
// };

// export const onParagraphConvert: OnParagraphConvert = (...args) => {
//   return caseMatch<Parameters<OnParagraphConvert>>()<void>(
//     [shotkey(']'), handleSquareBrackets],
//     [(...args) => args, (next) => next()],
//   )(...args);
// };

export const deserialize: Deserialize = (next, ast, editor, acc) => {
  if (ast.type === 'table') {
    return acc.concat({
      ...Table.create(),
      data: ast.children.map((tableRow: any) =>
        tableRow.children.map((tableCell: any) => {
          const text = tableCell.children[0];
          if (text?.type !== 'text') return null;
          return text.value;
        }),
      ),
    });
  }
  return next();
};

export const serialize: Serialize = (next, ele) => {
  if (Table.is(ele)) {
    return {
      type: 'table',
      align: ['center', 'center', 'center'],
      children: ele.data.map((rowData) => ({
        type: 'tableRow',
        children: rowData.map((cellData) => ({
          type: 'tableCell',
          children: [{ type: 'text', value: cellData }],
        })),
      })),
    };
  }
  return next();
};
