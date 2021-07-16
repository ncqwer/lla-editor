import { Editor } from 'slate';
import Render from './render';
import { withEditor } from './withEditor';
import { onKeyDownResponseZone } from './handler';
import { deserialize, serialize } from './convert';

export default {
  pluginName: 'link',
  renderElement: Render,
  withEditor,
  onKeyDownResponseZone,
  deserialize,
  serialize,
};
