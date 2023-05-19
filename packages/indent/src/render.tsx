import React from 'react';
import {
  ElementJSX,
  elementPropsIs,
  ExtendRenderElementProps,
  PlaceholderContext,
  // ConfigHelers,
  // SharedApi,
  // LLAConfig,
} from '@lla-editor/core';

import { IndentContainer } from './element';

// const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const DefaultIndent = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  element,
  attributes,
  ...others
}: ExtendRenderElementProps<IndentContainer>): JSX.Element => {
  // const [indentSize] = useLens(['indentContainer', 'indent']);
  return (
    <div {...others} {...attributes} className="lla-editor-text-block">
      {children}
    </div>
  );
};

export const IndentContainerContext =
  React.createContext<
    (props: ExtendRenderElementProps<IndentContainer>) => JSX.Element
  >(DefaultIndent);

const Indent = (
  props: ExtendRenderElementProps<IndentContainer>,
): JSX.Element => {
  const Wrapper = React.useContext(IndentContainerContext);
  return (
    <PlaceholderContext.Provider value="键入'/'获得帮助">
      <Wrapper {...props}></Wrapper>
    </PlaceholderContext.Provider>
  );
};

export default [
  [elementPropsIs(IndentContainer.is), Indent],
] as ElementJSX<IndentContainer>;
