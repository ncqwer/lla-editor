import { Editor, Element, Node } from 'slate';
import { BaseContainer, LLAElement, LLAConfig } from '@lla-editor/core';

const _TYPE_ = 'text-block';

export interface TextBlock extends BaseContainer {
  type: 'text-block';
  bgColor?: string;
  txtColor?: string;
  children: Element[];
}

export interface TextBlockConfig {
  indent?: number;
}

declare module '@lla-editor/core' {
  interface CustomContainer {
    TextBlock: TextBlock;
  }
  interface LLAConfig {
    textBlock: TextBlockConfig;
  }
}

/**
 * 请注意TextBlock作为containalbe，目前仅有两种形态：
 * - children.lenght === 1 && children[0] is paragraph
 * - children.length === 2 &&
 *   children[0] is paragraph
 *   children[1] is indentContainer
 */
export const TextBlock = {
  is(node: Node): node is TextBlock {
    return LLAElement.is(node) && node.type === _TYPE_;
  },
  create(editor?: Editor): TextBlock {
    const children = editor ? [editor.createParagraph('')] : [];
    return { children, type: _TYPE_ };
  },
};
