import { LLAElement } from '@lla-editor/core';
import { Editor, Element, Node } from 'slate';

const _TYPE_ = 'quote';

export interface QuoteElement {
  type: 'quote';
  bgColor?: string;
  txtColor?: string;
  children: Element[];
}

export const QuoteElement = {
  is(node: Node): node is QuoteElement {
    return LLAElement.is(node) && node.type === _TYPE_;
  },
  create(editor?: Editor): QuoteElement {
    const children = editor ? [editor.createParagraph('')] : [];
    return {
      type: _TYPE_,
      children,
    };
  },
};

declare module '@lla-editor/core' {
  interface CustomParagraph {
    QuoteElement: QuoteElement;
  }
}
