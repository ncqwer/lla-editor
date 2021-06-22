import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
import { onParagraphConvert } from './convert';
import { DividerElement } from './element';

export default {
  pluginName: 'divider',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  onParagraphConvert,
  // onKeyDownAlternative,
  insertInfo: [
    {
      keywords: ['divider', 'separator', 'split'],
      title: '分割线',
      description: '用来分割不同区域的内容',
      create: DividerElement.create,
    },
  ],
};
