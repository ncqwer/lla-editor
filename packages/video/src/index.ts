import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
// import { onParagraphConvert } from './convert';
import { VideoElement, createMediaBlock } from './element';

export default {
  pluginName: 'video',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  // onParagraphConvert,
  // onKeyDownAlternative,
  createMediaBlock,
  insertInfo: [
    {
      keywords: ['video', 'mp4'],
      title: '视频',
      description: '视频容器，用来呈现本地、在线视频',
      create: VideoElement.create,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/video.png',
    },
  ],
};
