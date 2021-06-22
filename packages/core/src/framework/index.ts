import { createP2E } from '@herbart-editor/pae';
import { pluginCompose, PluginImpl } from '../rules';

export const {
  PluginSet: PluginProvider,
  Environment,
  useEnvironment: useEditorRuntime,
} = createP2E('lla-editor-framwork', (plugins: PluginImpl[]) =>
  pluginCompose(...plugins),
);

export * from './Config';

export * from './Editable';

export * from './Editor';
