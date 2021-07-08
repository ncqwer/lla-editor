import { Editor } from 'slate';
import { HeadingElement } from './element';
import Render from './render';
import { withEditor } from './withEditor';
import { onKeyDownResponseZone } from './handler';
import { onParagraphConvert, deserialize, serialize } from './convert';

export default {
  pluginName: 'heading',
  renderElement: Render,
  withEditor,
  onKeyDownResponseZone,
  onParagraphConvert,
  deserialize,
  serialize,
  insertInfo: [
    {
      keywords: ['heading', 'heading1'],
      title: '标题1',
      description: '大的段落标题',
      create: (e: Editor) => HeadingElement.create(e, 1),
    },
    {
      keywords: ['heading', 'heading2'],
      title: '标题2',
      description: '中等段落标题',
      create: (e: Editor) => HeadingElement.create(e, 2),
    },
    {
      keywords: ['heading', 'heading3'],
      title: '标题3',
      description: '小的段落标题',
      create: (e: Editor) => HeadingElement.create(e, 3),
    },
  ],
};

export * from './element';
