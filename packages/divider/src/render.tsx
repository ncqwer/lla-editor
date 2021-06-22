import {
  ElementJSX,
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
} from '@lla-editor/core';
import React from 'react';
import { useSelected } from 'slate-react';
import { DividerElement } from './element';

const Divider = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<DividerElement>) => {
  const selected = useSelected();
  return (
    <div
      className={`${selected ? 'lla-selected' : ''} lla-divider`}
      {...attributes}
    >
      {children}
    </div>
  );
};

export default [
  [elementPropsIs(DividerElement.is), elementRender(Divider)],
] as ElementJSX<DividerElement>;
