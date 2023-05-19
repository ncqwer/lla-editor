import { BaseAtom, CreateMediaBlock, LLAElement } from '@lla-editor/core';
import { Node } from 'slate';

const _TYPE_ = 'audio';
export interface AudioElement extends BaseAtom {
  type: 'audio';
  src?: string | File;
  caption?: string;
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

export const createMediaBlock: CreateMediaBlock = (next, file) => {
  if (/(?:\.mp3|\.flac)/.test(file.name))
    return { ...AudioElement.create(), src: file };
  return next();
};

interface AudioConfig {
  audioOpen: () => Promise<string | File>;
  audioRemove: (src: string) => Promise<void>;
  audioUpload?: (file: File) => Promise<string>;
  audioSign: (src: string) => Promise<string>;
  loadingCover?: string;
  errorCover?: string;
}

declare module '@lla-editor/core' {
  interface CustomAtom {
    AudioElement: AudioElement;
  }
  interface LLAConfig {
    audio: AudioConfig;
  }
}
