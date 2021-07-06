import { Editor, Element, Node } from 'slate';
import { BaseContainer, LLAElement } from '@lla-editor/core';

const _TASK_ITEM_ = 'task_list_item';

export interface TaskListItem extends BaseContainer {
  type: 'task_list_item';
  checked: boolean;
  bgColor?: string;
  txtColor?: string;
  children: Element[];
}

const _BULLETED_ITEM_ = 'bulleted_list_item';
export interface BulletedListItem extends BaseContainer {
  type: 'bulleted_list_item';
  bgColor?: string;
  txtColor?: string;
}

const _NUMBEREED_ITEM_ = 'numbered_list_item';
export interface NumberedListItem extends BaseContainer {
  type: 'numbered_list_item';
  bgColor?: string;
  txtColor?: string;
  index: number;
}

declare module '@lla-editor/core' {
  interface CustomContainer {
    TaskListItem: TaskListItem;
    BulletedListItem: BulletedListItem;
    NumberedListItem: NumberedListItem;
  }
}

export const List = {
  isTask(node: Node): node is TaskListItem {
    return LLAElement.is(node) && node.type === _TASK_ITEM_;
  },
  isBulleted(node: Node): node is BulletedListItem {
    return LLAElement.is(node) && node.type === _BULLETED_ITEM_;
  },
  isNumbered(node: Node): node is NumberedListItem {
    return LLAElement.is(node) && node.type === _NUMBEREED_ITEM_;
  },
  createTask(editor?: Editor) {
    const children = editor ? [editor.createParagraph('')] : [];
    return {
      type: _TASK_ITEM_,
      checked: false,
      children,
    };
  },
  createBulleted(editor?: Editor) {
    const children = editor ? [editor.createParagraph('')] : [];
    return {
      type: _BULLETED_ITEM_,
      children,
    };
  },
  createNumbered(editor?: Editor) {
    const children = editor ? [editor.createParagraph('')] : [];
    return {
      type: _NUMBEREED_ITEM_,
      index: 1,
      children,
    };
  },
};
