import { LLAElement } from '@lla-editor/core';
import { Node, Text } from 'slate';

const _TYPE_ = 'divider';
export interface DividerElement {
  type: 'divider';
  children: Text[];
}

export const DividerElement = {
  is: (node: Node): node is DividerElement =>
    LLAElement.is(node) && node.type === _TYPE_,

  create: (): DividerElement => ({
    type: _TYPE_,
    children: [{ text: '' }],
  }),
};

declare module '@lla-editor/core' {
  interface CustomAtom {
    DividerElement: DividerElement;
  }
}
