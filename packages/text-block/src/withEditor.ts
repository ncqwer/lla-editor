import { LLAElement } from '@lla-editor/core';
import { Editor, Node, Transforms } from 'slate';
import { TextBlock } from './element';

export const withEditor = (e: Editor): Editor => {
  const {
    isContainable,
    isIndentable,
    normalizeNode,
    isParagraphable,
    isBgColorable,
    isTxtColorable,
  } = e;

  e.isContainable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isContainable) return isContainable(n);
    return false;
  };

  e.isIndentable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isIndentable) return isIndentable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  e.isBgColorable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isBgColorable) return isBgColorable(n);
    return false;
  };
  e.isTxtColorable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isTxtColorable) return isTxtColorable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (TextBlock.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  e.normalizeNode = function ([node, path]) {
    if (LLAElement.is(node) && node.type === 'paragraph') {
      const parent = Node.parent(this, path);
      if (!this.isParagraphable(parent))
        return Transforms.wrapNodes(this, TextBlock.create(this), { at: path });
    }
    if (Editor.isEditor(node) && node.children.length === 0) {
      return Transforms.insertNodes(this, TextBlock.create(this), { at: [0] });
    }
    return normalizeNode([node, path]);
  };
  return e;
};
