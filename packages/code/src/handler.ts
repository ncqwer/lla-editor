import detectIntent from 'detect-indent';
import {
  groupKeyDown,
  OnKeyDownResponseZone,
  OnKeyDownType,
  shotkey,
} from '@lla-editor/core';
import {
  Path,
  Transforms,
  Editor,
  Range,
  Node,
  Point,
  Text,
  Element,
} from 'slate';

import { Code, CodeBlock, CodeLine } from './element';

export const DEFAULT_TABLENGTH = 4;
export const DEFAULT_TABSPACE = ' '.repeat(DEFAULT_TABLENGTH);

const getSingleWordBias = (
  text: string,
  rule: RegExp,
  offset = 0,
): [number, number, boolean] => {
  let startBias = 0;
  let startCh = text[offset - startBias];
  let endBias = 0;
  let endCh = text[offset + endBias];
  if (text.length === 0 || !text[offset]) return [0, 0, false];
  const expected = rule.test(text[offset]);
  const testFunc = (ch: string) => rule.test(ch) === expected;
  while (startCh && testFunc(startCh)) {
    ++startBias;
    startCh = text[offset - startBias];
  }
  while (endCh && testFunc(endCh)) {
    ++endBias;
    endCh = text[offset + endBias];
  }
  if (startCh) --startBias;
  if (endCh) --endBias;
  return [startBias, endBias, expected];
};

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (Code.isCodeLine(node)) return handleKeyDown([node, path]);
  return next();
};

type KeyDown = OnKeyDownType<CodeLine>;

const variableChReg = /\w/;
const spaceReg = /^\s*$/;
const braketsStartReg = /[{([`]/;
const matchedBraketsReg = /(?:\{\})|(?:\[\])|(?:\(\))|(?:``)/;
const braketsEndReg = /[})\]`]/;

const handleEnter: KeyDown = function (next, event, editor, [codeline]) {
  const { selection } = editor;
  if (!selection) return next();
  // const [[startBlock]] = Code.edgeBlock(editor, selection);
  const text = Node.string(codeline);
  const indent = detectIntent(text).indent.replace('/t', DEFAULT_TABSPACE);
  const [isCollapsed, lCh, rCh] = Code.focusCharWhenCollapsed(editor);

  if (isCollapsed) {
    const newIndent = indent + DEFAULT_TABSPACE;
    const twoCh = [lCh, rCh].join('');
    if (matchedBraketsReg.test(twoCh)) {
      event.preventDefault();
      Transforms.splitNodes(editor);
      Transforms.insertText(editor, newIndent);
      Transforms.splitNodes(editor);
      Transforms.insertText(editor, indent);
      return Transforms.move(editor, {
        distance: indent.length + 1,
        reverse: true,
      });
    } else if (braketsStartReg.test(lCh)) {
      event.preventDefault();
      Transforms.insertText(editor, newIndent);
      Transforms.move(editor, { distance: newIndent.length, reverse: true });
      Transforms.splitNodes(editor);
      return Transforms.move(editor, { distance: newIndent.length });
    }
  }
  if (indent.length === 0) return;
  event.preventDefault();
  Transforms.insertText(editor, indent);
  Transforms.move(editor, { distance: indent.length, reverse: true });
  Transforms.splitNodes(editor);
  return Transforms.move(editor, { distance: indent.length });
};

const handleTab: KeyDown = function handleTab(next, event, editor) {
  event.preventDefault();
  return Transforms.insertText(editor, DEFAULT_TABSPACE);
};

const handleModD: KeyDown = function (next, event, editor, [codeline]) {
  const { selection } = editor;
  if (!selection) return next();
  // const [[startBlock]] = Code.edgeBlock(editor, selection);

  if (!Range.isCollapsed(selection)) return next();
  event.preventDefault();
  const offset = selection.focus.offset;
  const text = Node.string(codeline);
  let [startBias, endBias, expected] = getSingleWordBias(
    text,
    variableChReg,
    offset,
  ); // 向后匹配
  if (!expected && startBias === 0) {
    // 尝试向前匹配
    [startBias, endBias] = getSingleWordBias(text, variableChReg, offset - 1); // 向前匹配

    const newRange = Code.moveRange(selection, { start: -(startBias + 1) });
    return Transforms.select(editor, newRange);
    // return Transforms.moveStartBackward(startBias + 1);
  }
  const newRange = Code.moveRange(selection, {
    start: -startBias,
    end: endBias + 1,
  });
  return Transforms.select(editor, newRange);
  // return Transforms.moveStartBackward(startBias).moveEndForward(endBias + 1);
};

const handleModEnter: KeyDown = function (
  next,
  event,
  editor,
  [codeline, path],
) {
  const { selection } = editor;
  if (!selection) return;
  // const [[startBlock, startBlockPath]] = Code.edgeBlock(editor, selection);
  const indent = Code.codeLineIndent(codeline);
  Transforms.select(editor, Editor.end(editor, path));
  return Transforms.insertNodes(editor, Code.createCodeLine(indent));
};

const handleBackspace: KeyDown = function (
  next,
  event,
  editor,
  [codeline, path],
) {
  const { selection } = editor;
  if (!selection) return next();
  const [startPoint] = Range.edges(selection);
  if (Range.isCollapsed(selection)) {
    // 这里使用Array.from本质上只取迭代器的首个输出，是一种‘浪费‘的写法
    // 在ejs，默认[firstoutput] = iterator是正确的
    // 但对webpack打包，会将上述模式解释为 firstoutput=iterator[0],这导致了错误
    // const [[code, codePath]] = Code.targetNodeEntries(editor);
    // const [[code, codePath]] = Array.from(Code.targetNodeEntries(editor));
    const codePath = Path.parent(path);
    const code = Node.get(editor, codePath) as CodeBlock;
    const firstPoint = Editor.start(editor, codePath);
    if (Point.equals(firstPoint, startPoint)) {
      event.preventDefault();
      const str = Node.string(code);
      if (str === '')
        return Editor.withoutNormalizing(editor, () => {
          Transforms.removeNodes(editor, { at: codePath });
          Transforms.insertNodes(editor, editor.createParagraph(''), {
            at: codePath,
          });
          Transforms.select(editor, codePath);
        });
      return;
    }
  }
  // const [[startBlock, startBlockPath]] = Code.edgeBlock(editor, selection);
  const [isCollapsed, lCh, rCh] = Code.focusCharWhenCollapsed(editor);
  const twoCh = [lCh, rCh].join('');
  if (isCollapsed && matchedBraketsReg.test(twoCh)) {
    event.preventDefault();
    Transforms.delete(editor, { reverse: true });
    return Transforms.delete(editor);
  }
  const text = Node.string(codeline);
  if (!spaceReg.test(text)) return;
  const nowIndent = Code.codeLineIndent(codeline);
  const preIndents = Code.prevCodeLineIndent(editor, path);
  const avaliableIndent = preIndents
    .reverse()
    .find((indent) => indent.length < nowIndent.length);
  if (!avaliableIndent && avaliableIndent !== '') return;
  event.preventDefault();
  // console.log(preIndents);
  // console.log(`avaliableIndent:${avaliableIndent.length}`);
  return Transforms.insertText(editor, avaliableIndent, {
    at: startPoint.path,
  });
};

const handleModShiftK: KeyDown = function (next, event, editor) {
  event.preventDefault();
  const { selection } = editor;
  if (!selection) return next();
  const [startPoint, endPoint] = Range.edges(selection);
  const endText = Node.get(editor, endPoint.path) as Text;
  const newRange = Code.moveRange(selection, {
    start: -startPoint.offset,
    end: endText.text.length - endPoint.offset,
  });
  return Transforms.delete(editor, { at: newRange });
};

const handleModSlash: KeyDown = function (next, event, editor) {
  const { selection } = editor;
  if (!selection) return next();
  event.preventDefault();
  return Code.toggleCommentCodeLine(editor, { at: selection });
};

const handleModShiftUp: KeyDown = function handleModShiftUp(
  next,
  event,
  editor,
  [, path],
) {
  event.preventDefault();
  const { selection } = editor;
  if (!selection) return next();
  const [startPoint, endPoint] = Range.edges(selection);
  // const [[, codePath]] = Code.targetNodeEntries(editor);
  const codePath = Path.parent(path);
  const startCodeLineIdx = Path.relative(startPoint.path, codePath)[0];
  if (startCodeLineIdx === 0) return next();
  return Editor.withoutNormalizing(editor, () => {
    const prevPath = Path.previous(Path.parent(startPoint.path));
    const endBlockPath = Path.parent(endPoint.path);
    Transforms.moveNodes(editor, { at: prevPath, to: endBlockPath });
    const parentPrev = (v: Path) => Path.previous(Path.parent(v));
    return Transforms.select(editor, {
      anchor: {
        ...selection.anchor,
        path: parentPrev(selection.anchor.path).concat([0]),
      },
      focus: {
        ...selection.focus,
        path: parentPrev(selection.focus.path).concat([0]),
      },
    });
  });
};

const handleModShiftDown: KeyDown = function (next, event, editor, [, path]) {
  event.preventDefault();
  const { selection } = editor;
  if (!selection) return next();
  const [startPoint, endPoint] = Range.edges(selection);
  // const [[code, codePath]] = Code.targetNodeEntries(editor);
  const codePath = Path.parent(path);
  const code = Node.get(editor, codePath) as CodeBlock;
  const endCodeLineIdx = Path.relative(endPoint.path, codePath)[0];
  if (!Element.isElement(code)) return next();
  if (endCodeLineIdx === code.children.length - 1) return next();
  return Editor.withoutNormalizing(editor, () => {
    const nextPath = Path.next(Path.parent(endPoint.path));
    const startBlockPath = Path.parent(startPoint.path);
    Transforms.moveNodes(editor, { at: nextPath, to: startBlockPath });
    const parentNext = (v: Path) => Path.next(Path.parent(v));
    return Transforms.select(editor, {
      anchor: {
        ...selection.anchor,
        path: parentNext(selection.anchor.path).concat([0]),
      },
      focus: {
        ...selection.focus,
        path: parentNext(selection.focus.path).concat([0]),
      },
    });
  });
};

const handleModRightSquareBrakets: KeyDown = function (next, event, editor) {
  const { selection } = editor;
  if (!selection) return next();
  return Code.addIndent(editor, {
    at: selection,
    tabLength: DEFAULT_TABLENGTH,
  });
};

const handleModLeftSquareBrakets: KeyDown = function handleModLeftSquareBrakets(
  next,
  event,
  editor,
) {
  const { selection } = editor;
  if (!selection) return next();
  return Code.deleteIndent(editor, {
    at: selection,
    tabLength: DEFAULT_TABLENGTH,
  });
};

const handleCompensateBrakets: KeyDown = function (
  next,
  event,
  editor,
  [codeline],
) {
  const { selection } = editor;
  if (!selection) return next();
  // const [[startBlock]] = Code.edgeBlock(editor, selection);
  let appendText;
  if (event.key === '{') appendText = '}';
  if (event.key === '(') appendText = ')';
  if (event.key === '[') appendText = ']';
  if (event.key === '`') appendText = '`';
  if (Range.isCollapsed(selection)) {
    event.preventDefault();
    if (braketsEndReg.test(event.key)) {
      const offset = selection.anchor.offset;
      const text = Node.string(codeline);
      if (braketsEndReg.test(text[offset])) {
        // 已经存在不需要插入
        return Transforms.move(editor);
      }
      if (event.key !== '`') return Transforms.insertText(editor, event.key);
    }

    Transforms.insertText(editor, event.key + appendText);
    return Transforms.move(editor, { reverse: true });
  }
  if (!appendText) return next();
  event.preventDefault();
  return Code.compensateBrackets(editor, event.key, appendText);
};

const isCompensateBrakets = (...args: any) => {
  const event = args[1];
  if (braketsStartReg.test(event.key) || braketsEndReg.test(event.key))
    return args;
  return undefined;
};

const handleKeyDown = groupKeyDown<KeyDown>(
  [shotkey('enter'), handleEnter],
  [shotkey('tab'), handleTab],
  [shotkey('mod+d'), handleModD],
  [shotkey('mod+enter'), handleModEnter],
  [shotkey('backspace'), handleBackspace],
  [shotkey('mod+shift+k'), handleModShiftK],
  [shotkey('mod+/'), handleModSlash],
  [shotkey('mod+shift+up'), handleModShiftUp],
  [shotkey('mod+shift+down'), handleModShiftDown],
  [shotkey('mod+]'), handleModRightSquareBrakets],
  [shotkey('mod+['), handleModLeftSquareBrakets],
  [isCompensateBrakets, handleCompensateBrakets],
  // [shotkey('backspace'), handleBackspace],
  [(...args) => args, (next) => next()],
);
