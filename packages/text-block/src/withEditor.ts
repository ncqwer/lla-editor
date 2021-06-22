import { LLAElement } from '@lla-editor/core';
import { Editor, Node, Transforms } from 'slate';
import { TextBlock } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isContainable, isIndentable, normalizeNode, isParagraphable } = e;

  e.isContainable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isContainable) return isContainable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  e.isIndentable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isIndentable) return isIndentable(n);
    return false;
  };

  e.normalizeNode = ([node, path]) => {
    if (LLAElement.is(node) && node.type === 'paragraph') {
      const parent = Node.parent(e, path);
      console.log('h');
      if (!e.isParagraphable(parent))
        return Transforms.wrapNodes(e, TextBlock.create(e), { at: path });
    }
    if (Editor.isEditor(node) && node.children.length === 0) {
      return Transforms.insertNodes(e, TextBlock.create(e), { at: [0] });
    }
    return normalizeNode([node, path]);
  };
  return e;
};
