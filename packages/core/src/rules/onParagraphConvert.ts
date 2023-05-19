import React from 'react';
import type { Editor, NodeEntry } from 'slate';

import { BaseParagraph, Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type OnParagraphConvert = Nextify<
  (
    event: React.KeyboardEvent,
    editor: Editor,
    nodeEntry: NodeEntry<BaseParagraph>,
  ) => void
>;

export default defaultPropertyRule as DefaultRuleType<OnParagraphConvert>;
