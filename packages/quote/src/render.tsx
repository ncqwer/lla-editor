import {
  elementPropsIs,
  elementRender,
  ExtendRenderElementProps,
  PlaceholderContext,
} from '@lla-editor/core';
import { ElementJSX } from '@lla-editor/core';
import React from 'react';
import { useSelected } from 'slate-react';
import { QuoteElement } from './element';

const Quote: React.FC<ExtendRenderElementProps<QuoteElement>> = ({
  element,
  attributes,
  children,
  ...others
}) => {
  const selected = useSelected();
  return (
    <PlaceholderContext.Provider value={`引言`}>
      <div
        className={`${selected ? 'lla-selected' : ''} lla-quote`}
        {...attributes}
        {...others}
      >
        {children}
      </div>
    </PlaceholderContext.Provider>
  );
};

export default [
  [elementPropsIs(QuoteElement.is), elementRender(Quote)],
] as ElementJSX<QuoteElement>;
