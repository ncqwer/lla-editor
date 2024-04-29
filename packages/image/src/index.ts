import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone, onKeyDownAlternative } from './handler';
import { onParagraphConvert, deserialize, serialize } from './convert';
import { ImageElement, createMediaBlock } from './element';

export default {
  pluginName: 'image',
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
      keywords: ['image', 'picture'],
      title: '图片',
      description: '图片容器，用来呈现本地、在线图片',
      create: ImageElement.create,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/image.png',
    },
  ],
};

export { LoadingImage, ImageConfigContext } from './componnets/LoadingImage';
export * from './componnets/types';
export { getImageInfo } from './componnets/getImageInfo';
export { ResizedImage } from './render';
