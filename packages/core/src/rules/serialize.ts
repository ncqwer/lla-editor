import React from 'react';
import { Editor, Node } from 'slate';

import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type Deserialize = Nextify<
  (ast: any, editor: Editor, acc: Node[]) => Node[]
>;
export type Serialize = Nextify<(elment: Node, editor: Editor) => any>;

export const serialize = defaultPropertyRule as DefaultRuleType<Serialize>;
export const deserialize = defaultPropertyRule as DefaultRuleType<Deserialize>;
