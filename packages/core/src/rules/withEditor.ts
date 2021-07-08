import { PluginRuleObjType } from '@herbart-editor/pae';
import { Editor, Element, Node, Range, Transforms, Path } from 'slate';
import { Paragraph } from '../builtinPlugin/paragraph';
import { extractValueFromPlugin } from './utils';

export type WithEditor = (editor: Editor) => Editor;

const overSymbol = Symbol('overlayer');

const withDefault: WithEditor = (editor) => {
  const {
    createParagraph,
    isParagraphable,
    isBgColorable,
    isTxtColorable,
    insertData,
    setFragmentData,
  } = editor;

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

  editor.setFragmentData = (dataTransfer) => {
    setFragmentData(dataTransfer);
    const fragment = editor.getFragment();
    const mockEditor = {
      ...editor,
      children: fragment,
      onChange: () => {},
      selection: null,
    };
    const added: Element[] = [];
    Array.from(
      Editor.nodes(mockEditor, {
        at: [],
        match: (n): n is Element =>
          Paragraph.is(n) || mockEditor.isVoid(n as any),
      }),
    ).forEach(([node, path]) => {
      if (Paragraph.is(node)) {
        added.push({
          ...Editor.parent(mockEditor, path)[0],
          children: [node],
        });
      } else {
        //is void element
        added.push(node);
      }
    });
    dataTransfer.setData('text/json', JSON.stringify(fragment));
    dataTransfer.setData(
      'text/plain',
      added.map((v) => editor.serialize(v as any, editor)).join('\n'),
    );
  };

  /**
   * 注意这里覆盖掉原有的insertData
   * @param dataTransfer
   * @returns
   */
  editor.insertData = (dataTransfer) => {
    const { selection } = editor;
    if (!selection) return;

    const slateNodes = getSlateNodes(dataTransfer, editor);
    // const slateNodes: Node[] = JSON.parse(
    //   decodeURIComponent(
    //     window.atob(dataTransfer.getData('application/x-slate-fragment')),
    //   ),
    // );
    if (slateNodes && slateNodes.length > 0) {
      //不使用默认的insertData
      const target = Editor.above(editor, {
        at: editor.selection!.anchor.path,
        match: (n) =>
          Element.isElement(n) &&
          (editor.isParagraphable(n) || editor.isVoid(n)),
      });
      if (!target) return;
      const mockEditor = {
        ...editor,
        children: slateNodes,
        onChange: () => {},
        selection: null,
      };
      const added: Element[] = [];
      Array.from(
        Editor.nodes(mockEditor, {
          at: [],
          match: (n): n is Element =>
            Paragraph.is(n) || mockEditor.isVoid(n as any),
        }),
      ).forEach(([node, path]) => {
        if (Paragraph.is(node)) {
          added.push({
            ...Editor.parent(mockEditor, path)[0],
            children: [node],
          });
        } else {
          //is void element
          added.push(node);
        }
      });
      // if (Range.isExpanded(selection)) Transforms.delete(editor);
      // if (!editor.selection) return;
      const [e, path] = target;
      const [head, ...tail] = added;
      Editor.withoutNormalizing(editor, () => {
        if (!mockEditor.isVoid(head)) {
          const _pe = Editor.above(editor, {
            at: selection,
            match: (n) => Element.isElement(n) && editor.isParagraphable(n),
          });
          if (!_pe) return;
          const str = Node.string(_pe[0]);
          if (str) {
            Transforms.insertFragment(editor, [head]);
          } else {
            Transforms.removeNodes(editor, { at: _pe[1] });
            Transforms.insertNodes(editor, head, { at: _pe[1] });
            Transforms.select(editor, Editor.end(editor, _pe[1]));
          }
        } else {
          tail.unshift(head);
        }

        if (tail.length > 0) {
          const nextPath =
            editor.isParagraphable(e) && e.children.length > 1
              ? path.concat(1, 0)
              : Path.next(path);
          const nextPathRef = Editor.pathRef(editor, nextPath);
          tail.forEach((node) => {
            Transforms.insertNodes(editor, node, { at: nextPathRef.current! });
          });
          Transforms.select(
            editor,
            Editor.end(editor, Path.previous(nextPathRef.unref()!)),
          );
        }
      });
    } else {
      return insertData(dataTransfer);
    }
  };
  return editor;
};

const getSlateNodes = (
  dataTransfer: DataTransfer,
  editor: Editor,
): Element[] => {
  const files = Array.from(dataTransfer.files);
  let result = null;
  if (!result && files.length > 0) {
    //媒体文件和文字不支持同时粘贴
    try {
      result = files
        .map((file) => editor.createMediaBlock(file, editor))
        .filter(Boolean);
      if (result.length === 0) result = null;
    } catch {
      result = null;
    }
  }
  const data = dataTransfer.types.reduce(
    (acc, type) => ({ ...acc, [type]: dataTransfer.getData(type) }),
    {},
  );

  if (!result && data['application/x-slate-fragment']) {
    (() => {
      try {
        result = JSON.parse(
          decodeURIComponent(window.atob(data['application/x-slate-fragment'])),
        );
      } catch {
        result = null;
      }
    })();
  }
  if (!result && data['text/html']) {
    (() => {
      try {
        if (editor.html2md)
          result = editor
            .html2md(data['text/html'])
            .split('\n')
            // .map((str: string) => str.replace(/ /g, '&nsp,')).replace(/\s/)
            // .filter(Boolean)
            .map((str: string) => editor.deserialize(str, editor))
            .filter(Boolean);
      } catch {
        result = null;
      }
    })();
  }
  if (!result && data['text/plain']) {
    (() => {
      try {
        result = data['text/plain']
          .split('\n')
          // .map((str: string) => str.replace(/ /g, '&nsp,')).replace(/\s/)
          // .filter(Boolean)
          .map((str: string) => editor.deserialize(str, editor))
          .filter(Boolean);
      } catch {
        result = null;
      }
    })();
  }
  return result;
};

const impl = extractValueFromPlugin((...values: WithEditor[]) => {
  // compose
  return values.concat(withDefault).reduce(
    (acc, f) => (editor: Editor) => acc(f(editor)),
    (x) => x,
  );
});

export default impl;
