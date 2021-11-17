import { TextBlock } from './element';
import { onKeyDownResponseZone } from './handler';
import Render from './render';
import { withEditor } from './withEditor';
import { serialize } from './convert';

export default {
  pluginName: 'text-block',
  onKeyDownResponseZone,
  renderElement: Render,
  withEditor,
  // deserialize,
  serialize,
  insertInfo: [
    {
      keywords: ['text', 'paragraph'],
      title: '文本块',
      description: '简单的文本块，可缩进，可容纳缩进',
      create: TextBlock.create,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/textblock.png',
    },
  ],
};

export * from './element';
