import React from 'react';
import type { Editor, NodeEntry } from 'slate';

import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type OnKeyDownAlternative = Nextify<
  (event: React.KeyboardEvent, editor: Editor, nodeEntry?: NodeEntry) => void
>;

export default defaultPropertyRule as DefaultRuleType<OnKeyDownAlternative>;
