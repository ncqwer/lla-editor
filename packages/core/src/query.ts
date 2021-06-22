import { Node, Element, Text } from 'slate';
import { LLAContainer, LLAParagraph } from './index';

export const LLAQuery = {
  isContainer(node: Node): node is LLAContainer {
    return (
      Element.isElement(node) && node.children.every((n) => !Text.isText(n))
    );
  },
  isParagraph(node: Node): node is LLAParagraph {
    return (
      Element.isElement(node) && node.children.every((n) => Text.isText(n))
    );
  },
};
