import { Editor, Element } from 'slate';

import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type CreateMediaBlock = Nextify<
  (file: File, editor: Editor) => Element | null
>;

export const createMediaBlock =
  defaultPropertyRule as DefaultRuleType<CreateMediaBlock>;
