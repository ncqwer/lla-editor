import React from 'react';
import { Element } from 'slate';
import {
  DefaultElement,
  RenderElementProps,
  useSlateStatic,
} from 'slate-react';
import { Func } from '../type';
import { ExtendRenderLeafProps } from './renderLeaf';
import { caseMatch, extractValueFromPlugin } from './utils';

export type ExtendRenderElementProps<E extends Element> = Omit<
  RenderElementProps,
  'element'
> & {
  element: E;
};

export type ElementJSX<E extends Element = Element> = Array<
  [
    (e: RenderElementProps) => [ExtendRenderElementProps<E>] | undefined,
    (props: ExtendRenderElementProps<E>) => JSX.Element,
  ]
>;

// function <E extends Element>(
//   ...plugins: PluginRuleObjType<ElementJSX<E>>[]
// ) {
//   const values = plugins
//     .map(({ value }) => value)
//     .filter((v): v is ElementJSX<E> => !!v)
//     .flat();
//   return ({ element, ...others }: RenderElementProps) => {
//     for (const [is, Component] of values) {
//       if (is(element)) {
//         return <Component {...others} element={element}></Component>;
//       }
//     }
//     throw new Error(`插件中无法找到对应的React组件,当前节点:${element}`);
//   };
// }

const impl = extractValueFromPlugin(
  <E extends Element>(...vs: ElementJSX<E>[]) => {
    const values = vs.flat().concat([
      // [
      //   (props) => [props],
      //   (props) => {
      //     const { attributes, children, element } = props;
      //     const editor = useSlateStatic();
      //     const Tag = editor.isInline(element) ? 'span' : 'div';
      //     return (
      //       <Tag {...attributes} className="lla-paragraph">
      //         {children}
      //       </Tag>
      //     );
      //   },
      // ],
    ] as ElementJSX<E>);
    return caseMatch<[RenderElementProps]>()<
      JSX.Element,
      [ExtendRenderElementProps<E>]
    >(...values);
  },
);

export const elementRender =
  <T extends Func>(Comp: T) =>
  (...args: Parameters<T>) =>
    <Comp {...args[0]}></Comp>;

export default impl;
