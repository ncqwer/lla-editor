import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

const _TYPE_ = 'image';
export interface ImageElement extends BaseAtom {
  type: 'image';
  src?: string | File;
  alt?: string;
  caption?: string;
  width: number;
}

export const ImageElement = {
  is(node: Node): node is ImageElement {
    const ans = LLAElement.is(node) && node.type === _TYPE_;
    return ans;
  },
  create() {
    return {
      children: [{ text: '' }],
      type: _TYPE_,
      width: 1200,
    };
  },
};

export const createMediaBlock: CreateMediaBlock = (next, file, editor) => {
  if (/(?:\.png|\.jpeg|\.jpg)/.test(file.name))
    return { ...ImageElement.create(), src: file };
  return next();
};

interface ImageConfig {
  imgOpen: () => Promise<string | File>;
  imgRemove: (src: string) => Promise<void>;
  imgSign: (src: string) => Promise<string>;
  imgUpload?: (file: File) => Promise<string>;
  loadingCover: string;
  errorCover: string;
}
declare module '@lla-editor/core' {
  interface CustomAtom {
    ImageElement: ImageElement;
  }
  interface LLAConfig {
    image: ImageConfig;
  }
}
