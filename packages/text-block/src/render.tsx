import React from 'react';

import { TextBlock, TextBlockConfig } from './element';
import {
  ElementJSX,
  elementPropsIs,
  ExtendRenderElementProps,
  // ConfigHelers,
  // LLAConfig,
  // SharedApi,
} from '@lla-editor/core';
import { RenderElementProps, useSelected } from 'slate-react';

import { IndentContainerContext } from '@lla-editor/indent';

// const a: LLAConfig = {
//   ''
// }

// const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const TextIndentWrapper = ({
  children,
  attributes,
  element,
  ...others
}: RenderElementProps) => {
  // const [textBlockIndent] = useLens(['textBlock', 'indent']);
  // const [defaultIndent] = useLens(['indentContainer', 'indent']);
  // const indent = textBlockIndent || defaultIndent || 0;
  const selected = useSelected();
  return (
    <div
      {...others}
      {...attributes}
      className={`lla-text-block__container ${selected ? 'lla-selected' : ''}`}
    >
      {children}
    </div>
  );
};

const TextBlockComponent = ({
  children,
  attributes,
  element,
  ...others
}: ExtendRenderElementProps<TextBlock>): JSX.Element => {
  const { bgColor, txtColor } = element;
  return (
    <IndentContainerContext.Provider value={TextIndentWrapper}>
      <div
        {...others}
        {...attributes}
        className={`lla-text-block ${bgColor || ''} ${txtColor || ''}`}
      >
        {children}
      </div>
    </IndentContainerContext.Provider>
  );
};

export default [
  [elementPropsIs(TextBlock.is), TextBlockComponent],
] as ElementJSX<TextBlock>;
