import React from 'react';
import {
  ElementJSX,
  elementPropsIs,
  ExtendRenderElementProps,
  // ConfigHelers,
  // SharedApi,
  // LLAConfig,
} from '@lla-editor/core';

import { IndentContainer } from './element';

// const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const DefaultIndent = ({
  children,
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

  return <Wrapper {...props}></Wrapper>;
};

export default [
  [elementPropsIs(IndentContainer.is), Indent],
] as ElementJSX<IndentContainer>;
