import { PluginRuleObjType } from '@herbart-editor/pae';
import React from 'react';
import { Editor, NodeEntry, Node } from 'slate';
import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type OnKeyDownType<N extends Node> = Nextify<
  (event: React.KeyboardEvent, editor: Editor, nodeEntry: NodeEntry<N>) => void
>;

export type OnKeyDownResponseZone = Nextify<
  (
    nodeEntry: NodeEntry,
  ) => Nextify<(event: React.KeyboardEvent, editor: Editor) => void>
>;

// export default function <N extends Node>(
//   ...plugins: PluginRuleObjType<OnKeyDownResponseZone<N>>[]
// ): OnKeyDownResponseZone<N> {
//   return defaultPropertyRule(...plugins);
// }

export default defaultPropertyRule as DefaultRuleType<OnKeyDownResponseZone>;
