import { Editor, Node, Element, Transforms } from 'slate';
import { ExcalidrawElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid, normalizeNode } = e;

  e.isVoid = (n) => {
    if (ExcalidrawElement.is(n)) return true;
    return isVoid(n);
  };

  e.normalizeNode = ([node, path]) => {
    if (Element.isElement(node) && e.isVoid(node)) {
      const parent = Node.parent(e, path);
      if (
        !Editor.isEditor(parent) &&
        (parent as any).type !== 'indent_container'
      ) {
        return Transforms.unwrapNodes(e, { at: path.slice(0, -1) });
      }
    }
    return normalizeNode([node, path]);
  };

  return e;
};
