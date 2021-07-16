import { Editor, Node, Transforms } from 'slate';
import { LinkElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isInline, normalizeNode } = e;

  e.isInline = (n) => {
    if (LinkElement.is(n)) return true;
    return isInline(n);
  };
  e.normalizeNode = ([node, path]) => {
    if (LinkElement.is(node)) {
      const str = Node.string(node);
      if (!str) Transforms.removeNodes(e, { at: path });
      return;
    }
    return normalizeNode([node, path]);
  };
  return e;
};
