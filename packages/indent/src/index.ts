import { onKeyDownResponseZone, handleKeyDownAlternative } from './handler';
import Render from './render';
import { withEditor } from './withEditor';

export default {
  pluginName: 'indent-container',
  onKeyDownResponseZone,
  onKeyDownAlternative: handleKeyDownAlternative,
  renderElement: Render,
  withEditor,
};

export { IndentContainerContext } from './render';

export * from './element';
