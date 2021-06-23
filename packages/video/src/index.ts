import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
// import { onParagraphConvert } from './convert';
import { VideoElement } from './element';

export default {
  pluginName: 'video',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  // onParagraphConvert,
  // onKeyDownAlternative,
  insertInfo: [
    {
      keywords: ['video', 'mp4'],
      title: '视频',
      description: '视频容器，用来呈现本地、在线视频',
      create: VideoElement.create,
    },
  ],
};
