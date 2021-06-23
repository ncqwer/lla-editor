import { BaseAtom, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

const _TYPE_ = 'audio';
export interface AudioElement extends BaseAtom {
  type: 'audio';
  src?: string;
  caption?: string;
  width: number;
}

export const AudioElement = {
  is(node: Node): node is AudioElement {
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

interface AudioConfig {
  audioOpen: () => Promise<string>;
  audioRemove: (src: string) => Promise<void>;
  audioSign: (src: string) => Promise<string>;
  loadingCover: string;
  errorCover: string;
}

declare module '@lla-editor/core' {
  interface CustomAtom {
    AudioElement: AudioElement;
  }
  interface LLAConfig {
    audio: AudioConfig;
  }
}
