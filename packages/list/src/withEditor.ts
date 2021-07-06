import { Editor, Element, Transforms } from 'slate';
import { List } from './element';
import { IndentContainer } from '@lla-editor/indent';

export const withEditor = (editor: Editor) => {
  const e = editor;

  const {
    isContainable,
    isIndentable,
    normalizeNode,
    isParagraphable,
    isBgColorable,
    isTxtColorable,
  } = e;

  e.isBgColorable = (n) => {
    if (List.isTask(n) || List.isBulleted(n) || List.isNumbered(n)) return true;
    if (isBgColorable) return isBgColorable(n);
    return false;
  };
  e.isTxtColorable = (n) => {
    if (List.isTask(n) || List.isBulleted(n) || List.isNumbered(n)) return true;
    if (isTxtColorable) return isTxtColorable(n);
    return false;
  };

  e.isContainable = (node) => {
    if (List.isTask(node) || List.isBulleted(node) || List.isNumbered(node))
      return true;
    if (isContainable) return isContainable(node);
    return false;
  };
  e.isParagraphable = (node) => {
    if (List.isTask(node) || List.isBulleted(node) || List.isNumbered(node))
      return true;
    if (isParagraphable) return isParagraphable(node);
    return false;
  };

  e.isIndentable = (node) => {
    if (List.isTask(node) || List.isBulleted(node) || List.isNumbered(node))
      return true;
    if (isIndentable) return isIndentable(node);
    return false;
  };
  e.normalizeNode = ([node, path]) => {
    if (Editor.isEditor(node) || IndentContainer.is(node)) {
      (node.children as any as Node[]).reduce((prevIdx, n, idx) => {
        if (Element.isElement(n) && List.isNumbered(n)) {
          if (n.index !== prevIdx + 1) {
            Transforms.setNodes(
              editor,
              { index: prevIdx + 1 },
              { at: path.concat(idx) },
            );
          }
          return prevIdx + 1;
        }
        return 0;
      }, 0);
      // return Transforms.removeNodes(editor, { at: path });
    }
    return normalizeNode([node, path]);
  };
  return e;
};
