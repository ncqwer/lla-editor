import React from 'react';
import { Transforms } from 'slate';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';
import type { RenderElementProps } from 'slate-react';
import {
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  PlaceholderContext,
} from '@lla-editor/core';
import { IndentContainerContext } from '@lla-editor/indent';
import {
  TaskListItem,
  BulletedListItem,
  NumberedListItem,
  List,
} from './element';

const IndentContainerWrapper = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  element,
  attributes,
  children,
}: RenderElementProps) => {
  return (
    <div className="lla-list-item__container" {...attributes}>
      {children}
    </div>
  );
};
const MyComp = () => null;

const Task = ({
  element,
  attributes,
  children,
}: ExtendRenderElementProps<TaskListItem>) => {
  const { checked = false, bgColor, txtColor } = element;
  const editor = useSlateStatic();
  const selected = useSelected();
  const readOnly = useReadOnly();
  return (
    <div
      {...attributes}
      className={`lla-list-item lla-list-item--task ${
        checked ? 'lla-list-item--done' : ''
      } ${selected ? 'lla-selected' : ''} ${bgColor || ''} ${txtColor || ''}`}
    >
      <div className="lla-list-item__leading" contentEditable={false}>
        <input
          type="checkbox"
          className="lla-list-item__leading__content"
          checked={checked}
          onChange={(e) => !readOnly && handleChange(e.target.checked)}
        />
      </div>
      <IndentContainerContext.Provider value={IndentContainerWrapper}>
        <PlaceholderContext.Provider value="待办事项">
          <div className="lla-list-item__content">{children}</div>
        </PlaceholderContext.Provider>
      </IndentContainerContext.Provider>
    </div>
  );

  function handleChange(checked: boolean) {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { checked }, { at: path });
  }
};
const Numbered = ({
  element,
  children,
  attributes,
}: ExtendRenderElementProps<NumberedListItem>) => {
  const { index, bgColor, txtColor } = element;
  const selected = useSelected();
  return (
    <div
      {...attributes}
      className={`lla-list-item lla-list-item--numbered ${
        selected ? 'lla-selected' : ''
      } ${bgColor || ''} ${txtColor || ''}`}
    >
      <div className="lla-list-item__leading" contentEditable={false}>
        <div className="lla-list-item__leading__content">
          <span>{index}.</span>
        </div>
        <MyComp></MyComp>
      </div>
      <IndentContainerContext.Provider value={IndentContainerWrapper}>
        <PlaceholderContext.Provider value="有序列表">
          <div className="lla-list-item__content">{children}</div>
        </PlaceholderContext.Provider>
      </IndentContainerContext.Provider>
    </div>
  );
};
const Bulleted = ({
  children,
  attributes,
  element,
}: ExtendRenderElementProps<BulletedListItem>) => {
  const { bgColor, txtColor } = element;
  const selected = useSelected();
  return (
    <div
      {...attributes}
      className={`lla-list-item lla-list-item--bulleted ${
        selected ? 'lla-selected' : ''
      } ${bgColor || ''} ${txtColor || ''}`}
    >
      <div className="lla-list-item__leading" contentEditable={false}>
        <div className="lla-list-item__leading__content">
          <span>•</span>
        </div>
      </div>
      <IndentContainerContext.Provider value={IndentContainerWrapper}>
        <PlaceholderContext.Provider value="无序列表">
          <div className="lla-list-item__content">{children}</div>
        </PlaceholderContext.Provider>
      </IndentContainerContext.Provider>
    </div>
  );
};

export default [
  [elementPropsIs(List.isTask), elementRender(Task)],
  [elementPropsIs(List.isBulleted), elementRender(Bulleted)],
  [elementPropsIs(List.isNumbered), elementRender(Numbered)],
] as ElementJSX<TaskListItem | BulletedListItem | NumberedListItem>;
