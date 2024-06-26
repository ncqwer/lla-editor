import React from 'react';
import { Text, Element, Node, Editor, Path } from 'slate';
import type {
  BaseText,
  BaseRange,
  BaseElement,
  BaseEditor,
  NodeEntry,
} from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { ContextMenuInfo } from './framework/overlayer/contextMenu';

// type helpers
type ValueTypeForRecord<T> = T[keyof T];
// type ExtendType<K extends ExtendableTypes, Z> = unknown extends LLACustom[K]
//   ? Z
//   : ValueTypeForRecord<LLACustom[K]>;

export type Func = (...args: any[]) => any;

export type TupleTail<T> = T extends [any, ...infer U] ? U : never;

export type TupleFirst<T> = T extends [...infer U, any] ? U : never;
export type TupleLast<T> = T extends [...any[], infer U] ? U : never;

export type TupleCopy<T, S extends any> = {
  [P in keyof T]: P extends keyof S ? S[P] : never;
};

export type UnionToIntersection<T> = (
  T extends any ? (arg: T) => void : never
) extends (arg: infer U) => void
  ? U
  : never;

export type Nextify<T extends Func> = (
  next: () => ReturnType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

export type NextifParams<T extends Func> = (
  next: (...args: Parameters<T>) => ReturnType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

// export type NextifyWithInstance<T extends Func> = (
//   next: () => ReturnType<T>,
//   instance: (...args: Parameters<T>) => ReturnType<T>,
//   ...args: Parameters<T>
// ) => ReturnType<T>;
// lla node type

// type ExtendableTypes = 'Container' | 'Paragraph';

// export interface LLACustom {
//   interface Container {
//     BaseElement: BaseElement;
//   };
//   [key: string]: unknown;
// }

export interface CustomContainer {
  BaseContainer: BaseContainer;
}

export interface BaseContainer {
  type: string;
  children: any[];
}

export interface CustomParagraph {
  BaseParagraph: BaseParagraph;
}

export interface BaseParagraph {
  children: Text[];
  type: string;
}

export interface CustomRange {}

export interface StyledText extends BaseText {
  italic?: boolean;
  bold?: boolean;
  lineThrough?: boolean;
  underline?: boolean;
  inlineCode?: boolean;
  bgColor?: string;
  txtColor?: string;
}

export interface CustomText {
  StyledText: StyledText;
}

export interface CustomOverLayer {
  insert: {
    open: (path: [Path, number]) => void;
    close: () => void;
    up: () => void;
    down: () => void;
    enter: () => void;
    isEmpty: () => boolean;
  };
  contextMenu: {
    open: (info: ContextMenuInfo) => void;
  };
}

export interface LLABaseEditor {
  createParagraph: (text: string) => Element;
  convertFromParagraph: Nextify<
    (
      event: React.KeyboardEvent,
      editor: Editor,
      entry: NodeEntry<BaseParagraph>,
    ) => void
  >;
  serialize: (element: Node, editor: Editor) => any;
  deserialize: (ast: any, editor: Editor, acc: Node[]) => Node[];
  createMediaBlock: (file: File, editor: Editor) => Element | null;
  html2md?: (str: string) => any;
  txt2md?: (str: string) => any;
  md2txt?: (obj: any) => string;
  isParagraphable: (element: Element) => boolean;
  isBgColorable: (element: Node) => boolean;
  isTxtColorable: (element: Node) => boolean;
  getOvlerLayer: <T extends keyof CustomOverLayer>(
    layerName: T,
  ) => CustomOverLayer[T] | undefined;
  registerOverLayer: <T extends keyof CustomOverLayer>(
    layerName: T,
    layer: CustomOverLayer[T],
  ) => void;
}

export interface CustomEditor {
  BaseEditor: BaseEditor;
  ReactEditor: ReactEditor;
  HistoryEditor: HistoryEditor;
  LLABaseEditor: LLABaseEditor;
}

export interface BaseAtom extends BaseElement {
  children: [{ text: '' }];
  type: string;
}
export interface CustomAtom {
  BaseAtom: BaseAtom;
}

export type LLAContainer = ValueTypeForRecord<CustomContainer>;

export type LLAParagraph = ValueTypeForRecord<CustomParagraph>;
export type LLARange = ValueTypeForRecord<CustomRange>;
export type LLAAtom = ValueTypeForRecord<CustomAtom>;

export type LLAEditor = UnionToIntersection<ValueTypeForRecord<CustomEditor>>;

export type LLAElement = LLAContainer | LLAParagraph | LLAAtom;
export type LLAText = ValueTypeForRecord<CustomText>;

export const LLAElement = {
  is(node: Node): node is LLAElement {
    return Element.isElement(node) && (node as any)?.type != null;
  },
};

export interface LLAConfig {
  core: {
    html2md?: (v: string) => string;
    txt2md?: (v: string) => any;
    md2txt?: (ast: any) => string;
    overlayerId: string;
  };
}

declare module 'slate' {
  interface CustomTypes {
    Element: LLAElement | BaseElement;
    Editor: LLAEditor;
    Text: LLAText;
    Range: LLARange | BaseRange;
  }
}
