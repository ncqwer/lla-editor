import { LLAElement } from '@lla-editor/core';
import { Editor, Element, Node, Text } from 'slate';

const _TYPE_ = 'link';

export interface LinkElement {
  type: 'link';
  url: string;
  children: Text[];
}

export const LinkElement = {
  is(node: Node): node is LinkElement {
    return LLAElement.is(node) && node.type === _TYPE_;
  },
  create(url: string, text = url): LinkElement {
    return {
      type: _TYPE_,
      url,
      children: [{ text }],
    };
  },
};

declare module '@lla-editor/core' {
  interface CustomParagraph {
    LinkElement: LinkElement;
  }
}
