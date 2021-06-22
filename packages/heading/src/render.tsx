import {
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  PlaceholderContext,
} from '@lla-editor/core';
import { ElementJSX } from '@lla-editor/core';
import React from 'react';
import { useSelected } from 'slate-react';
import { HeadingElement } from './element';

const Heading: React.FC<ExtendRenderElementProps<HeadingElement>> = ({
  element,
  attributes,
  children,
  ...others
}) => {
  const { level } = element;
  const selected = useSelected();
  return (
    <PlaceholderContext.Provider value={`标题${level}`}>
      <div
        className={`${
          selected ? 'lla-selected' : ''
        } lla-heading lla-heading-${level}`}
        {...attributes}
        {...others}
      >
        {children}
      </div>
    </PlaceholderContext.Provider>
  );
};

export default [
  [elementPropsIs(HeadingElement.is), elementRender(Heading)],
] as ElementJSX<HeadingElement>;
