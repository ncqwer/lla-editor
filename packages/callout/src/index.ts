import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
// import { onParagraphConvert } from './convert';
import { CalloutElement } from './element';

export default {
  pluginName: 'callout',
  renderElement: render,
  onKeyDownResponseZone,
  withEditor,
  // onParagraphConvert,
  // onKeyDownAlternative,
  insertInfo: [
    {
      keywords: ['callout', 'markup', 'emphasize'],
      title: '标记文本',
      description: '用来强调某一特定文本',
      create: CalloutElement.create,
    },
  ],
};
