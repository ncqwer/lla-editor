import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Editor, Node } from 'slate';

const _TYPE_ = 'custom-void';
export interface CustomVoidElement extends BaseAtom {
  type: 'custom-void';
  value: any;
  mode: string;
}

export const CustomVoidElement = {
  is(node: Node): node is CustomVoidElement {
    const ans = LLAElement.is(node) && node.type === _TYPE_;
    return ans;
  },
  create(editor?: Editor, mode?: string, initialValue?: any) {
    return {
      children: [{ text: '' }],
      type: _TYPE_,
      mode,
      value: initialValue,
    };
  },
};

declare module '@lla-editor/core' {
  interface CustomAtom {
    CustomVoidElement: CustomVoidElement;
  }
}
