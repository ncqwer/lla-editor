import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

export const _TYPE_ = 'excalidraw';
export interface ExcalidrawElement extends BaseAtom {
  type: 'excalidraw';
  src?: string | File;
  alt?: string;
  caption?: string;
  width: number;
  height: number;
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
      width: 700,
      height: 300,
    };
  },
};

export const createMediaBlock: CreateMediaBlock = (next, file) => {
  if (/(?:\.png|\.jpeg|\.jpg)/.test(file.name))
    return { ...ExcalidrawElement.create(), src: file };
  return next();
};

interface ExcalidrawConfig {
  imgOpen: () => Promise<string | File>;
  imgRemove: (src: string) => Promise<void>;
  imgSign: (
    src: string,
    options?: { width: number; height: number },
  ) => Promise<string>;
  imgUpload?: (file: File) => Promise<string>;
  loadingCover: string;
  errorCover: string;
}
declare module '@lla-editor/core' {
  interface CustomAtom {
    ExcalidrawElement: ExcalidrawElement;
  }
  interface LLAConfig {
    Excalidraw: ExcalidrawConfig;
  }
}
