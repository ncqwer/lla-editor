import { LLAElement } from '@lla-editor/core';
import { Editor, Element, Node } from 'slate';

const _TYPE_ = 'heading';

type HeadingLevel = 1 | 2 | 3;
export interface HeadingElement {
  type: 'heading';
  level: HeadingLevel;
  children: Element[];
}

export const HeadingElement = {
  is(node: Node): node is HeadingElement {
    return LLAElement.is(node) && node.type === _TYPE_;
  },
  create(editor?: Editor, level: HeadingLevel = 1): HeadingElement {
    const children = editor ? [editor.createParagraph('')] : [];
    return {
      type: _TYPE_,
      level,
      children,
    };
  },
};

declare module '@lla-editor/core' {
  interface CustomParagraph {
    Heading: HeadingElement;
  }
}
