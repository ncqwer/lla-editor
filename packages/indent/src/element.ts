import { BaseEditor, BaseElement, Element, Node } from 'slate';
import { BaseContainer, LLAContainer, LLAElement } from '@lla-editor/core';
// import { Container } from 'react-dom';

export const _TYPE_ = 'indent_container';

export interface IndentContainer extends BaseContainer {
  children: LLAContainer[];
  type: 'indent_container';
}

export interface IndentContainerConfig {
  indent: number;
}

export interface IndentContainerEditor extends BaseEditor {
  isIndentable: (node: Element) => boolean;
  isContainable: (node: Element) => boolean;
}

declare module '@lla-editor/core' {
  interface CustomContainer {
    IndentContainer: IndentContainer;
  }
  interface LLAConfig {
    indentContainer: IndentContainerConfig;
  }
  interface CustomEditor {
    IndentContainerEditor: IndentContainerEditor;
  }
}

export const IndentContainer = {
  is(node: Node): node is IndentContainer {
    const a = LLAElement.is(node) && node.type === _TYPE_;
    return a;
  },

  create() {
    return {
      children: [],
      type: _TYPE_,
    };
  },
};
