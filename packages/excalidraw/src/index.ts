import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone, onKeyDownAlternative } from './handler';
import { onParagraphConvert, deserialize, serialize } from './convert';
import { ExcalidrawElement, createMediaBlock } from './element';

export default {
  pluginName: 'excalidraw',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  onParagraphConvert,
  onKeyDownAlternative,
  deserialize,
  serialize,
  createMediaBlock,
  insertInfo: [
    {
      keywords: ['excalidraw', 'picture'],
      title: 'Excalidraw',
      description: 'Excalidraw',
      create: ExcalidrawElement.create,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/image.png',
    },
  ],
};
