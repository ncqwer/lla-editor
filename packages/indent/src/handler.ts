import {
  Text,
  Node,
  Element,
  Editor,
  NodeEntry,
  Path,
  Range,
  Transforms,
  Point,
  PathRef,
} from 'slate';
import {
  OnKeyDownResponseZone,
  caseMatch,
  shotkey,
  LLAElement,
  OnKeyDownType,
  Nextify,
  NextifParams,
  groupKeyDown,
  OnKeyDownAlternative,
} from '@lla-editor/core';

import { IndentContainer } from './element';
import React from 'react';

export const onKeyDownResponseZone: OnKeyDownResponseZone = (
  next,
  [node, path],
) => {
  if (IndentContainer.is(node)) return handleKeyDown([node, path]);
  return next();
};

type keyDownType = OnKeyDownType<IndentContainer>;

/**
 * [backspace]快捷键：当快捷键不被捕获并且selection闭合的时候,进行以下操作：
 *  - 如果selection在块的尾部,将当前所在块移动为IndentContainer的父亲节点的后继兄弟节点
 *  - next
 *
 * @param next 执行后续
 * @param event 键盘事件
 * @param editor 当前的编辑器对象
 */
const handleBackspace: keyDownType = (next, event, editor, [node, path]) => {
  const selection = editor.selection;
  if (!selection) return next();
  if (Range.isExpanded(selection)) return next();
  const relativePath = Path.relative(selection.anchor.path, path);
  if (
    relativePath[0] !== node.children.length - 1 ||
    selection.anchor.offset !== 0
  ) {
    if (selection.anchor.offset === 0) {
      const child = node.children[relativePath[0]];
      if (
        editor.isContainable(child) &&
        child.children.length > 1 &&
        relativePath[0] === 0
      ) {
        //当前容器包含indent-container,且删除行在首部
        Transforms.unwrapNodes(editor, {
          at: path.concat(relativePath[0], 1),
        });
      }
      //readme:这里需要想办法交给onKeyDownAlternative的同时跳开外层indentcontainer的捕获
      (function () {
        //readme: 用来解决在IndentContainer内部遇见void块无法正确避开的问题
        const start = selection.anchor;
        if (start.offset !== 0) return;
        const previousPoint = Editor.before(editor, start);
        if (!previousPoint) return;
        let path = previousPoint.path.slice(0, -1);
        let element = Node.get(editor, path);
        let flag = false;
        while (Editor.isVoid(editor, element)) {
          flag = true;
          path = Path.previous(path);
          element = Node.get(editor, path);
        }
        // if (ImageElement.is(element)) {
        if (flag) {
          // event.preventDefault();
          Transforms.moveNodes(editor, {
            at: start.path.slice(0, -2),
            to: Path.next(path),
          });
        }
      })();
    }
    return;
  }
  event.preventDefault();
  Editor.withoutNormalizing(editor, () => {
    Transforms.moveNodes(editor, {
      at: path.concat(relativePath[0]),
      to: Path.next(Path.parent(path)),
    });
    if (node.children.length === 1)
      Transforms.removeNodes(editor, { at: path });
    // console.log(editor.children);
  });

  return;
};

export const handleKeyDown = groupKeyDown<keyDownType>(
  [shotkey('backspace'), handleBackspace],
  [(...args) => args, (next) => next()],
);

const doNothing = (e: React.KeyboardEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

/**
 * [tab]快捷键：仅仅处理selection闭合的状态，
 *  - 按照顺序（low->high），寻找第一个indentable=true的Element,
 *    - 如果当前元素为其父元素的第一个元素，则：do nothing
 *    - 如果不是,则判断其前继兄弟节点是不是containeable,
 *      - 是，将当前indentable=true的元素包含在indentContainer
 *      - 不是，do nothing
 *
 * @param next 执行后续
 * @param event 键盘事件
 * @param editor 当前的编辑器对象
 */
export const handleTab: OnKeyDownAlternative = (next, event, editor) => {
  const selection = editor.selection;
  if (!selection) return next();
  if (selection && Range.isExpanded(selection)) return next();
  const [nodeEntry] =
    Editor.levels(editor, {
      at: selection.anchor.path,
      reverse: true,
      match: (n): n is Element => {
        const h = Element.isElement(n) && editor.isIndentable(n);
        return h;
      },
    }) || [];
  if (!nodeEntry) return next();
  const [_, path] = nodeEntry;
  const idx = path[path.length - 1];
  if (idx === 0) return doNothing(event);
  const previousElementPath = path.slice(0, -1).concat(idx - 1);
  const previousElement = Node.get(editor, previousElementPath) as Element;
  if (!editor.isContainable(previousElement)) return doNothing(event);
  event.preventDefault();
  if (previousElement.children.length === 1) {
    // 没有现存的IndentContainer,需要创建一个
    return Editor.withoutNormalizing(editor, () => {
      Transforms.wrapNodes(editor, IndentContainer.create(), { at: path });
      Transforms.moveNodes(editor, {
        at: path,
        to: previousElementPath.concat(1),
      });
    });
  }
  if (
    previousElement.children.length === 2 &&
    IndentContainer.is(previousElement.children[1])
  ) {
    // 将当前element插入合适的位置
    const idx = previousElement.children[1].children.length;
    return Transforms.moveNodes(editor, {
      at: path,
      to: previousElementPath.concat(1, idx),
    });
  }
  return doNothing(event);
};

/**
 * 处理缩进块，
 *  - 如果当前包含缩进，则新行将位于缩进块的首部，其内容与缩进块首部一致
 *  - 如果不包含缩进，则根据当前行创建内容
 * @param next
 * @param event
 * @param editor
 * @returns
 */
const handleEnter: OnKeyDownAlternative = (next, event, editor) => {
  const { selection } = editor;
  if (!selection) return next();
  const result = Editor.above(editor, {
    at: selection,
    mode: 'lowest',
    match: (node) => Element.isElement(node) && editor.isContainable(node),
  });
  if (!result) return next();
  const [node, path] = result;
  const [, end] = Range.edges(selection);
  const textEnd = Editor.end(editor, path.concat(0));

  const moveRangeRef = Point.isBefore(end, textEnd)
    ? Editor.rangeRef(editor, { anchor: end, focus: textEnd })
    : null;
  // if (Point.isBefore(end, textEnd)) {
  //   // 文本没有完全删除
  //   remainStr = text.text.slice(end.offset);
  //   range = { anchor: start, focus: textEnd };
  // } else {
  //   // 没有剩余文本
  //   range = selection;
  // }
  let newPathRef: PathRef;
  let newBlock: any;
  if (node.children[1]) {
    // 当前文本有缩进行
    newPathRef = Editor.pathRef(editor, path.concat(1, 0));
    newBlock = Object.assign({}, (node.children[1] as any).children[0], {
      children: [],
    });
  } else {
    newPathRef = Editor.pathRef(editor, Path.next(path));
    newBlock = Object.assign({}, node, {
      children: [],
    });
  }
  if (newBlock.bgColor) delete newBlock.bgColor;
  if (newBlock.txtColor) delete newBlock.txtColor;
  event.preventDefault();
  return Editor.withoutNormalizing(editor, () => {
    Transforms.splitNodes(editor, { at: selection });

    const ran = moveRangeRef?.unref();
    if (ran) {
      let [start, end] = Editor.edges(editor, ran);
      if ((Node.get(editor, start.path) as Text).text.length === start.offset) {
        const ne = Editor.next(editor, { at: start.path, match: Text.isText });
        if (!ne) return;
        start = { path: ne[1], offset: 0 };
      }

      const newPath = newPathRef.unref();
      const startRef = Editor.pointRef(editor, start);
      if (!newPath) return;
      Transforms.insertNodes(editor, newBlock, { at: newPath });

      Transforms.moveNodes(editor, {
        at: { anchor: start, focus: end },
        to: newPath.concat(0),
        // mode: 'highest',
      });
      Transforms.select(editor, startRef.unref()!);
    } else {
      const newPath = newPathRef.unref();
      if (!newPath) return;
      Transforms.insertNodes(
        editor,
        { ...newBlock, children: [editor.createParagraph('')] },
        { at: newPath },
      );
      Transforms.select(editor, Editor.start(editor, newPath));
    }
    // console.log('hhh')
  });
};

export const handleKeyDownAlternative: OnKeyDownAlternative = (...args) => {
  return caseMatch<Parameters<OnKeyDownAlternative>>()(
    [shotkey('tab'), handleTab],
    [shotkey('enter'), handleEnter],
    [shotkey('shift+enter'), handleEnter],
    [(...args) => args, (next) => next()],
  )(...args);
};
