import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

const _TYPE_ = 'video';
export interface VideoElement extends BaseAtom {
  type: 'video';
  src?: string | File;
  caption?: string;
  width: number;
}

export const VideoElement = {
  is(node: Node): node is VideoElement {
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

interface VideoConfig {
  videoOpen: () => Promise<string | File>;
  videoRemove: (src: string) => Promise<void>;
  videoUpload?: (src: File) => Promise<void>;
  videoSign: (src: string, options?: { width: number }) => Promise<string>;
  loadingCover?: string;
  errorCover?: string;
}

declare module '@lla-editor/core' {
  interface CustomAtom {
    VideoElement: VideoElement;
  }
  interface LLAConfig {
    video: VideoConfig;
  }
}

export const createMediaBlock: CreateMediaBlock = (next, file) => {
  if (/(?:\.mp4)/.test(file.name))
    return { ...VideoElement.create(), src: file };
  return next();
};
