import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
// import { onParagraphConvert } from './convert';
import { AudioElement, createMediaBlock } from './element';

export default {
  pluginName: 'image',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  createMediaBlock,
  // onParagraphConvert,
  // onKeyDownAlternative,
  insertInfo: [
    {
      keywords: ['audio', 'music'],
      title: '音频',
      description: '音频容器，用来呈现本地、在线音频',
      create: AudioElement.create,
    },
  ],
};
