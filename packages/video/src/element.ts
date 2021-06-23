import { BaseAtom, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

const _TYPE_ = 'video';
export interface VideoElement extends BaseAtom {
  type: 'video';
  src?: string;
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
  videoOpen: () => Promise<string>;
  videoRemove: (src: string) => Promise<void>;
  videoSign: (src: string) => Promise<string>;
  loadingCover: string;
  errorCover: string;
}

declare module '@lla-editor/core' {
  interface CustomAtom {
    VideoElement: VideoElement;
  }
  interface LLAConfig {
    video: VideoConfig;
  }
}
