import React from 'react';
import { Text } from 'slate';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { caseMatch, extractValueFromPlugin } from './utils';

export type ExtendRenderLeafProps<T extends Text> = Omit<
  RenderLeafProps,
  'leaf'
> & {
  leaf: T;
};

export type LeafJSX<T extends Text = Text> = [
  (t: RenderLeafProps) => [ExtendRenderLeafProps<T>] | undefined,
  (props: ExtendRenderLeafProps<T>) => JSX.Element,
][];

const impl = extractValueFromPlugin(<T extends Text>(...vs: LeafJSX<T>[]) =>
  caseMatch<[RenderLeafProps]>()<JSX.Element, [ExtendRenderLeafProps<T>]>(
    ...vs
      .flat()
      .concat([[(props) => [props], DefaultLeaf as any]] as LeafJSX<T>),
  ),
);

export default impl;
