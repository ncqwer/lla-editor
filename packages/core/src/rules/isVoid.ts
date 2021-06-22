import { Nextify } from '../type';
import { defaultPropertyRule, DefaultRuleType } from './utils';

export type IsVoid = Nextify<(element: Element) => boolean>;

export default defaultPropertyRule as DefaultRuleType<IsVoid>;
