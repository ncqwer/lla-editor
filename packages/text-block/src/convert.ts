// import { Node } from 'slate';
import { Serialize } from '@lla-editor/core';
import { TextBlock } from './element';

// export const deserialize: Deserialize = (next, str, editor) => {
//   const v = next();
//   if (!v)
//     return {
//       ...TextBlock.create(editor),
//       children: [editor.createParagraph(str)],
//     };
//   return v;
// };

export const serialize: Serialize = (next, element, editor) => {
  if (TextBlock.is(element)) {
    return {
      type: 'paragraph',
      children: element.children[0].children
        .map((v) => editor.serialize(v, editor))
        .filter(Boolean),
    };
  }
  return next();
};
