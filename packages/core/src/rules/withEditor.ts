import { PluginRuleObjType } from '@herbart-editor/pae';
import { Editor, Element, Node } from 'slate';
import { extractValueFromPlugin } from './utils';

export type WithEditor = (editor: Editor) => Editor;

const overSymbol = Symbol('overlayer');

const withDefault: WithEditor = (editor) => {
  const { createParagraph, isParagraphable, isBgColorable, isTxtColorable } =
    editor;

  editor.createParagraph = (str: string) => {
    if (createParagraph) return createParagraph(str);
    return {
      type: 'paragraph',
      children: [{ text: str }],
    };
  };

  editor.registerOverLayer = (layerName, layer) => {
    if (!editor[overSymbol]) editor[overSymbol] = new Map<string, any>();
    editor[overSymbol].set(layerName, layer);
    return () => editor[overSymbol]?.set(layerName, undefined);
  };

  editor.getOvlerLayer = (layerName) => {
    if (!editor[overSymbol]) return;
    return editor[overSymbol].get(layerName);
  };

  editor.isParagraphable = (element: Element) => {
    if (isParagraphable) return isParagraphable(element);
    return false;
  };

  editor.isBgColorable = (element: Node) => {
    if (isBgColorable) return isBgColorable(element);
    return false;
  };

  editor.isTxtColorable = (element: Node) => {
    if (isTxtColorable) return isTxtColorable(element);
    return false;
  };
  return editor;
};

const impl = extractValueFromPlugin((...values: WithEditor[]) => {
  // compose
  return values.concat(withDefault).reduce(
    (acc, f) => (editor: Editor) => acc(f(editor)),
    (x) => x,
  );
});

export default impl;
