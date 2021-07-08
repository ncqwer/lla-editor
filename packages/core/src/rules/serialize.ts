import React from 'react';
import { Editor, Element } from 'slate';

import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type Deserialize = Nextify<
  (str: string, editor: Editor) => Element | null
>;
export type Serialize = Nextify<(elment: Element, editor: Editor) => string>;

export const serialize = defaultPropertyRule as DefaultRuleType<Serialize>;
export const deserialize = defaultPropertyRule as DefaultRuleType<Deserialize>;
