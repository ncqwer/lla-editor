import { Node } from 'slate';
import { Deserialize, Serialize } from '@lla-editor/core';
import { TextBlock } from './element';

export const deserialize: Deserialize = (next, str, editor) => {
  const v = next();
  if (!v)
    return {
      ...TextBlock.create(editor),
      children: [editor.createParagraph(str)],
    };
  return v;
};

export const serialize: Serialize = (next, element, editor) => {
  if (TextBlock.is(element)) {
    return Node.string(element);
  }
  return next();
};
