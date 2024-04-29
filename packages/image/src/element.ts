import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';
import { ImageInfo, ImageLoadingConfig } from './componnets/types';

const _TYPE_ = 'image';
export interface ImageElement extends BaseAtom {
  type: 'image';
  src?: string | ImageInfo;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export const ImageElement = {
  is(node: Node): node is ImageElement {
    const ans = LLAElement.is(node) && node.type === _TYPE_;
    return ans;
  },
  create(): ImageElement {
    return {
      children: [{ text: '' }],
      type: _TYPE_,
    };
  },
};

export const createMediaBlock: CreateMediaBlock = (next, file) => {
  if (/(?:\.png|\.jpeg|\.jpg)/.test(file.name))
    return { ...ImageElement.create(), src: file };
  return next();
};

interface ImageConfig extends Partial<ImageLoadingConfig> {
  imgOpen: () => Promise<string | Blob>;
  imgRemove: (src: string) => Promise<void>;
  imgSign: (
    src: string,
    options?: { width: number; height: number },
  ) => Promise<string>;
  imgUpload?: (file: Blob, breakpoints?: number[]) => Promise<string>;
}
declare module '@lla-editor/core' {
  interface CustomAtom {
    ImageElement: ImageElement;
  }
  interface LLAConfig {
    image: ImageConfig;
  }
}
