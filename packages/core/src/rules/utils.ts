import type { PluginRuleObjType } from '@herbart-editor/pae';
import { isHotkey } from 'is-hotkey';
import { Element, Text } from 'slate';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import { Nextify, Func, NextifParams } from '../index';
import { TupleFirst, TupleLast } from '../type';
import { ExtendRenderElementProps } from './renderElement';
import { ExtendRenderLeafProps } from './renderLeaf';

export const nextifyFlow = <T extends Func>(
  ...middlewares: Nextify<T>[]
): Nextify<T> => {
  type Next = () => ReturnType<T>;
  return (n: Next, ...args: Parameters<T>) =>
    middlewares.reduce(
      (acc, middleware) => (next: Next) => acc(() => middleware(next, ...args)),
      (n: Next) => n(),
    )(n);
};

export const nextifParamsFlow = <T extends Func>(
  ...middlewares: NextifParams<T>[]
): NextifParams<T> => {
  type NextParam = (...args: Parameters<T>) => ReturnType<T>;
  return (n, ..._args) =>
    middlewares.reduce(
      (acc, middleware) => (next: NextParam) => {
        const step: NextParam = function (...args) {
          return middleware(next, ...args);
        };
        return acc(step);
      },
      (n: NextParam) => n(..._args),
    )(n);
};

export type DefaultRuleType<T> = (...plugins: PluginRuleObjType<T>[]) => T;

export const extractValueFromPlugin =
  <T, Ret>(f: (...args: T[]) => Ret) =>
  (...plugins: PluginRuleObjType<T>[]) => {
    const values = plugins.map(({ value }) => value).filter((v): v is T => !!v);
    return f(...values);
  };

// export const defaultPropertyRule = <T extends Func>(
//   ...plugins: PluginRuleObjType<Nextify<T>>[]
// ) => {
//   const tmp = plugins
//     .map(({ value }) => value)
//     .filter((v): v is Nextify<T> => !!v);
//   return nextifyFlow(...tmp);
// };

export const defaultPropertyRule = extractValueFromPlugin(nextifyFlow);

// type ConditionAction<T extends any[], S> = [
//   (...args: any[]) => boolean,
//   (next: S, ...args: T) => void,
// ];

// export const ifFlow =
//   <T extends any[], S>(next: S, ...args: T) =>
//   (...conditionActions: ConditionAction<T, S>[]) => {
//     for (const [condtion, action] of conditionActions) {
//       if (condtion(...args)) return action(next, ...args);
//     }
//   };

const defaultErrorHandler = (...args: any[]) => {
  throw new Error(`当前没有找到匹配的分支,当前环境:${args}`);
};
export const caseMatch =
  <From extends any[]>(
    errorHandler: (...args: From) => never = defaultErrorHandler,
  ) =>
  <Ret = void, To extends any[] = From>(
    ...cases: [(...args: From) => To | undefined, (...args: To) => Ret][]
  ) => {
    return (...args: From) => {
      for (const [convert, match] of cases) {
        const v = convert(...args);
        if (v) return match(...v);
      }
      errorHandler(...args);
    };
  };

const hotKeyMap = new Map<string, (event: KeyboardEvent) => boolean>();

const getHotkey = (str: string) => {
  if (_SHOTKEY_MOCK_ === true) return ({ raw }: any) => raw === str;
  let f = hotKeyMap.get(str);
  if (f) return f;
  f = (event) =>
    isHotkey(str)(event) ||
    (event.keyCode === 229 && event.key === str.toLowerCase());
  hotKeyMap.set(str, f);
  return f;
};

let _SHOTKEY_MOCK_ = false;
export const setShotKeyMock = (status = true) => (_SHOTKEY_MOCK_ = status);
export const mockKey = (str: string) => {
  const hasCtrl = /ctrl/.test(str);
  const hasShift = /shift/.test(str);
  const hasAlt = /alt/.test(str);
  return {
    status: false, // mock preventDefault
    preventDefault: function preventDefault() {
      this.status = true;
    },
    altKey: hasAlt,
    ctrlKey: hasCtrl,
    shiftKey: hasShift,
    raw: str,
  } as any;
};

export const shotkey =
  (str: string) =>
  <T extends any[]>(...args: T): T | undefined => {
    if (getHotkey(str)(args[1])) {
      return args;
    }
    return undefined;
  };

export const groupKeyDown = <F extends Func>(
  ...cases: [(...args: Parameters<F>) => Parameters<F> | undefined, F][]
) => {
  type Ret = ReturnType<F>;
  type Params = Parameters<F>;
  return (nodeEntry: TupleLast<Params>) =>
    (...args: TupleFirst<Params>) =>
      caseMatch<Params>()<Ret>(...cases)(
        ...([...args, nodeEntry] as any as Params),
      );
};
// readme: 当前函数的逻辑与实现与[textPropsIs]相同，仅仅函数签名不同,如果修改，请保证一致性
export const elementPropsIs =
  <E extends Element>(isF: (e: Element) => e is E) =>
  (props: RenderElementProps): [ExtendRenderElementProps<E>] | undefined => {
    const element = props.element;
    if (isF(element)) {
      return [{ ...props, element }];
    }
    return undefined;
  };

// readme: 当前函数的逻辑与实现与[elementPropsIs]相同，仅仅函数签名不同,如果修改，请保证一致性
export const textPropsIs =
  <T extends Text>(isF: (e: Text) => e is T) =>
  (props: RenderLeafProps): [ExtendRenderLeafProps<T>] | undefined => {
    const leaf = props.leaf;
    if (isF(leaf)) {
      return [{ ...props, leaf }];
    }
    return undefined;
  };
