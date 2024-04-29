import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import type { ImageInfo } from '@lla-editor/image';
import { Node } from 'slate';

export const _TYPE_ = 'excalidraw';
export interface ExcalidrawElement extends BaseAtom {
  type: 'excalidraw';
  info?: {
    src: ImageInfo;
    excalidrawId: string;
  };
  width?: number;
  height?: number;
}

export const ExcalidrawElement = {
  is(node: Node): node is ExcalidrawElement {
    const ans = LLAElement.is(node) && node.type === _TYPE_;
    return ans;
  },
  create(): ExcalidrawElement {
    return {
      children: [{ text: '' }],
      type: _TYPE_,
    };
  },
};

export const createMediaBlock: CreateMediaBlock = (next, file) => {
  if (/(?:\.png|\.jpeg|\.jpg)/.test(file.name))
    return { ...ExcalidrawElement.create(), src: file };
  return next();
};

interface ExcalidrawConfig {
  saveFile: (id: string, data: any) => Promise<string>;
  createUniqueFileKey: () => Promise<string>;
  preFetchFile: (key: string) => Promise<string>;
  getFile: (key: string) => any;
  deleteFile: () => Promise<void>;
}
declare module '@lla-editor/core' {
  interface CustomAtom {
    ExcalidrawElement: ExcalidrawElement;
  }
  interface LLAConfig {
    excalidraw: ExcalidrawConfig;
  }
}
