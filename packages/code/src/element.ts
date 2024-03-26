import { Text, Node, Editor, Path, Range, Transforms } from 'slate';

import type { BaseElement, BaseRange, BaseText } from 'slate';
import { BaseContainer, LLAElement } from '@lla-editor/core';
import detectIntent from 'detect-indent';

const commentReg = /^(\s*)\/\//;

const _CODE_LINE_TYPE_ = 'codeline' as const;
export interface CodeLine extends BaseElement {
  type: typeof _CODE_LINE_TYPE_;
  children: Text[];
}

const _CODE_TYPE_ = 'codeblock' as const;
export interface CodeBlock extends BaseContainer {
  type: typeof _CODE_TYPE_;
  language: string;
  children: CodeLine[];
}

const _RANGE_ = 'prismjs-token' as const;
export interface PrismTokenRage extends BaseRange {
  type: typeof _RANGE_;
  className: string;
}

export interface PrismText extends BaseText {
  type: typeof _RANGE_;
  className: string;
}

const insertCharAtOffset = (str: string, offset: number, ch: string) => {
  const leftStr = str.slice(0, offset);
  const rightStr = str.slice(offset);
  return Array.prototype.join.call([leftStr, ch, rightStr], '');
};

export const Code = {
  isCode(node: Node): node is CodeBlock {
    return LLAElement.is(node) && node.type === _CODE_TYPE_;
  },
  isCodeLine(node: Node): node is CodeLine {
    return LLAElement.is(node) && node.type === _CODE_LINE_TYPE_;
  },
  isPrismText(node: Node): node is PrismText {
    return Text.isText(node) && (node as any).type === _RANGE_;
  },

  createCodeBlock() {
    return {
      children: [Code.createCodeLine()],
      language: 'javascript',
      type: _CODE_TYPE_,
    };
  },

  createCodeLine(text: string = '') {
    return {
      children: [{ text }],
      type: _CODE_LINE_TYPE_,
    };
  },

  focusCharWhenCollapsed(editor: Editor): [boolean, string, string] {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) return [false, '', ''];
    const textElement = Node.get(editor, selection.focus.path);
    const text = (textElement as Text).text;
    return [
      true,
      text[selection.focus.offset - 1],
      text[selection.focus.offset],
    ];
  },

  moveRange(range: Range, opt: { start?: number; end?: number }): Range {
    const { start, end } = Object.assign({ start: 0, end: 0 }, opt);
    const [startPoint, endPoint] = Range.edges(range);
    const newStartPoint = { ...startPoint, offset: startPoint.offset + start };
    const newEndPoint = { ...endPoint, offset: endPoint.offset + end };
    return Range.isForward(range)
      ? { anchor: newStartPoint, focus: newEndPoint }
      : { anchor: newEndPoint, focus: newStartPoint };
  },

  codeLineIndent(codeLineBlock: Node, tabSpace = '    ') {
    const text = Node.string(codeLineBlock);
    return detectIntent(text).indent.replace('/t', tabSpace);
  },

  prevCodeLineIndent(editor: Editor, path: Path) {
    const parentBlock = Node.parent(editor, path);
    const idx = path[path.length - 1];
    return parentBlock.children
      .slice(0, idx)
      .map((child) => Code.codeLineIndent(child as CodeLine));
  },

  toggleCommentCodeLine(editor: Editor, { at: range }: { at: Range }) {
    const allTexts = Array.from(
      Node.texts(editor, { from: range.anchor.path, to: range.focus.path }),
    );
    const startText = allTexts[0][0];
    const endText = allTexts[allTexts.length - 1][0];
    const isAllCommenLine = allTexts
      .map(([text]) => commentReg.test(text.text))
      .reduce((acc, has) => acc && has);
    const [startPoint, endPoint] = Range.edges(range);
    if (!isAllCommenLine) {
      const indentNum = Math.min(
        ...allTexts.map(([text]) => Code.codeLineIndent(text).length),
      );
      const indent = ' '.repeat(indentNum);
      // add comment
      const startStep = indentNum >= startPoint.offset ? 0 : 2; // '//'.length ===3
      const endStep = indentNum >= endPoint.offset ? 0 : 2;
      const newRange = Range.isCollapsed(range)
        ? Code.moveRange(range, { start: startStep, end: startStep })
        : Code.moveRange(range, { start: startStep, end: endStep });
      return Editor.withoutNormalizing(editor, () => {
        allTexts.forEach(([text, path]) => {
          const textStr = text.text;
          const newStr = textStr.replace(indent, `${indent}//`);
          return Transforms.insertText(editor, newStr, { at: path });
        });
        return Transforms.select(editor, newRange);
      });
    } else {
      const a = (commentReg.exec(startText.text) as unknown as string)[1]
        .length;
      const b = (commentReg.exec(endText.text) as unknown as string)[1].length;
      // const startStep = a >= startPoint.offset ? 0 : 2;
      const c = a >= startPoint.offset ? 0 : 2;
      // const endStep = b >= endPoint.offset ? 0 : 2;
      const d = b >= endPoint.offset ? 0 : 2;
      const newRange = Code.moveRange(range, { start: -c, end: -d });
      return Editor.withoutNormalizing(editor, () => {
        allTexts.forEach(([text, path]) => {
          const textStr = text.text;
          const newStr = textStr.replace(commentReg, '$1');
          return Transforms.insertText(editor, newStr, { at: path });
        });
        return Transforms.select(editor, newRange);
      });
    }
  },

  addIndent(
    editor: Editor,
    { at: range, tabLength = 4 }: { at: Range; tabLength: number },
  ) {
    const allTexts = Array.from(
      Node.texts(editor, { from: range.anchor.path, to: range.focus.path }),
    );
    const newRange = {
      anchor: {
        path: range.anchor.path,
        offset: range.anchor.offset + tabLength,
      },
      focus: {
        path: range.focus.path,
        offset: range.focus.offset + tabLength,
      },
    };
    const tabSpace = ' '.repeat(tabLength);
    return Editor.withoutNormalizing(editor, () => {
      allTexts.forEach(([text, path]) => {
        const textStr = text.text;
        const newStr = tabSpace + textStr;
        Transforms.insertText(editor, newStr, { at: path });
      });
      Transforms.select(editor, newRange);
    });
  },

  deleteIndent(
    editor: Editor,
    { at: range, tabLength = 4 }: { at: Range; tabLength?: number },
  ) {
    const allTexts = Array.from(
      Node.texts(editor, { from: range.anchor.path, to: range.focus.path }),
    );
    const tabSpace = ' '.repeat(tabLength);
    let startStep = 0;
    let endStep = 0;
    return Editor.withoutNormalizing(editor, () => {
      allTexts.forEach(([text, path], idx) => {
        const textStr = text.text;
        const indentLen = Code.codeLineIndent(text, tabSpace).length;
        let newIndentLen = indentLen - tabLength;
        if (newIndentLen < 0) newIndentLen = 0;
        const sliceIdx = indentLen - newIndentLen;
        const newStr = textStr.slice(sliceIdx);
        if (idx === 0) startStep = sliceIdx;
        if (idx === allTexts.length - 1) endStep = sliceIdx;
        Transforms.insertText(editor, newStr, { at: path });
      });
      const newRange = Range.isCollapsed(range)
        ? Code.moveRange(range, { start: -startStep, end: -startStep })
        : Code.moveRange(range, { start: -startStep, end: -endStep });
      Transforms.select(editor, newRange);
    });
  },

  compensateBrackets(editor: Editor, startCh: string, endCh: string) {
    const { selection } = editor;
    if (!selection) return;
    const [startPoint, endPoint] = Range.edges(selection);
    const startText = Node.get(editor, startPoint.path) as Text;
    const endText = Node.get(editor, endPoint.path) as Text;

    const startOffset = startPoint.offset;
    const endOffset = endPoint.offset;
    if (startText === endText) {
      const newStartText = insertCharAtOffset(
        (startText as unknown as Text).text,
        startOffset,
        startCh,
      );
      const newEndText = insertCharAtOffset(newStartText, endOffset + 1, endCh);
      Transforms.insertText(editor, newEndText, { at: startPoint.path });
      return Transforms.select(editor, {
        anchor: {
          path: selection.anchor.path,
          offset: selection.anchor.offset + 1,
        },
        focus: {
          path: selection.focus.path,
          offset: selection.focus.offset + 1,
        },
      });
    }
    const newStartText = insertCharAtOffset(
      startText.text,
      startOffset,
      startCh,
    );
    const newEndText = insertCharAtOffset(endText.text, endOffset, endCh);
    Transforms.insertText(editor, newStartText, { at: startPoint.path });
    Transforms.insertText(editor, newEndText, { at: endPoint.path });
    return Transforms.select(editor, {
      anchor: {
        path: startPoint.path,
        offset: startPoint.offset + 1,
      },
      focus: endPoint,
    });
  },
};

interface CodeConfig {
  katex: any;
}

declare module '@lla-editor/core' {
  interface CustomParagraph {
    CodeLine: CodeLine;
  }
  interface CustomContainer {
    CodeBlock: CodeBlock;
  }
  interface CustomRange {
    PrismTokenRage: PrismTokenRage;
  }
  interface CustomText {
    PrismText: PrismText;
  }
  interface LLAConfig {
    code: CodeConfig;
  }
}
