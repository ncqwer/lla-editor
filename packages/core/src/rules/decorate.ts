// import type{ PluginRuleObjType } from '@herbart-editor/pae';
import type { Node, NodeEntry, Range } from 'slate';
import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type Decorate<N extends Node = Node> = Nextify<
  (nodeEntry: NodeEntry<N>) => Range[]
>;

// export default function <N extends Node>(
//   ...plugins: PluginRuleObjType<Decorate<N>>[]
// ): Decorate<N> {
//   return defaultPropertyRule(...plugins);
// }

export default defaultPropertyRule as DefaultRuleType<Decorate>;
