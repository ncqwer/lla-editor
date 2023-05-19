import { Editor, Node, Transforms, Path } from 'slate';
import type { BaseElement } from 'slate';
import { Code, CodeLine } from './element';
import '@lla-editor/indent';

export const withEditor = (editor: Editor) => {
  const e = editor;

  const { isContainable, isIndentable, normalizeNode, isParagraphable } = e;

  e.isContainable = (node) => {
    if (Code.isCode(node) || Code.isCodeLine(node)) return false;
    if (isContainable) return isContainable(node);
    return false;
  };

  e.isParagraphable = (node) => {
    if (Code.isCode(node) || Code.isCodeLine(node)) return false;
    if (isParagraphable) return isParagraphable(node);
    return false;
  };

  e.isIndentable = (node) => {
    if (Code.isCode(node)) return true;
    if (isIndentable) return isIndentable(node);
    return false;
  };

  e.normalizeNode = ([node, path]) => {
    if (Code.isCode(node)) {
      let p: Path | null = null;
      node.children.forEach((codeline: CodeLine | BaseElement, i) => {
        if (Code.isCodeLine(codeline)) return;
        const str = Node.string(codeline);
        p = path.concat(i);
        Transforms.removeNodes(editor, { at: p });
        Transforms.insertNodes(editor, Code.createCodeLine(str), {
          at: p,
        });
      });
      if (p) Transforms.select(editor, Editor.start(editor, p));
    }
    return normalizeNode([node, path]);
  };
  return e;
};
