import { LLAElement } from '@lla-editor/core';
import { Editor, Node, Element } from 'slate';

const _TYPE_ = 'callout';
export interface CalloutElement {
  type: 'callout';
  emoji: string;
  bgColor?: string;
  txtColor?: string;
  children: Element[];
}

export const CalloutElement = {
  is: (node: Node): node is CalloutElement =>
    LLAElement.is(node) && node.type === _TYPE_,

  create: (editor?: Editor): CalloutElement => ({
    type: _TYPE_,
    emoji: '😀',
    children: editor ? [editor.createParagraph('')] : [],
  }),
};

declare module '@lla-editor/core' {
  interface CustomAtom {
    CalloutElement: CalloutElement;
  }
}
