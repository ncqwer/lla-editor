import { Editor } from 'slate';
import { QuoteElement } from './element';
import Render from './render';
import { withEditor } from './withEditor';
import { onKeyDownResponseZone } from './handler';
import { onParagraphConvert } from './convert';

export default {
  pluginName: 'heading',
  renderElement: Render,
  withEditor,
  onKeyDownResponseZone,
  onParagraphConvert,
  insertInfo: [
    {
      keywords: ['quote'],
      title: '引言',
      description: '引言区',
      create: QuoteElement.create,
    },
  ],
};
