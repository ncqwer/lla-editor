import { Editor } from 'slate';
import { withEditor } from './withEditor';
import render from './render';
import { onKeyDownResponseZone } from './handler';
// import { onParagraphConvert } from './convert';
import { CustomVoidElement } from './element';

export default (
  ...customVoids: {
    keywords: string[];
    title: string;
    description: string;
    mode: string;
    Comp: any;
    initialValue: any;
  }[]
) => ({
  pluginName: 'custom-void',
  renderElement: render(...customVoids),
  onKeyDownResponseZone,
  withEditor,
  insertInfo: customVoids.map(
    ({ keywords, title, description, mode, initialValue }) => ({
      keywords,
      title,
      description,
      create: (editor: Editor) =>
        CustomVoidElement.create(editor, mode, initialValue),
    }),
  ),
});
