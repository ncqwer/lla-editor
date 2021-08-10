import { decorate, renderElement, renderLeaf } from './render';
import { onKeyDownResponseZone } from './handler';
import { withEditor } from './withEditor';
import { onParagraphConvert, deserialize, serialize } from './convert';
import { Code } from './element';

export default {
  pluginName: 'lla-code',
  renderElement,
  renderLeaf,
  decorate,
  onKeyDownResponseZone,
  withEditor,
  deserialize,
  serialize,
  onParagraphConvert,
  insertInfo: [
    {
      keywords: ['code', 'codeblock'],
      title: '代码块',
      description: '用来呈现具有高亮的代码',
      create: Code.createCodeBlock,
      cover:
        'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/bulletlist.png',
    },
  ],
};
