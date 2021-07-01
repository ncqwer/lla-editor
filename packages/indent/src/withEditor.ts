import { Editor, Element, Transforms } from 'slate';
import { IndentContainer, IndentContainerEditor } from './element';

export const withEditor = <T extends Editor>(editor: T) => {
  const e = editor as T & IndentContainerEditor;

  const { isIndentable, normalizeNode } = e;

  // e.isContainable = (node: Element) => {
  //   if (Editor.isEditor(e)) return true;
  //   if (isContainable) return isContainable(node);
  //   return false;
  // };

  e.isIndentable = function (node: Element) {
    if (isIndentable) return isIndentable(node);
    if (e.isVoid(node)) return true;
    return false;
  };
  e.normalizeNode = ([node, path]) => {
    if (Element.isElement(node) && editor.isContainable(node)) {
      const firstChild = node.children[0];
      if (Element.isElement(firstChild) && IndentContainer.is(firstChild)) {
        Transforms.unwrapNodes(editor, { at: path }); //去除当前container
        return Transforms.unwrapNodes(editor, { at: path }); //去除IndentContainer
      }
      // return Transforms.removeNodes(editor, { at: path });
    }
    return normalizeNode([node, path]);
  };
  return e;
};
