import { Editor } from 'slate';

import { CalloutElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isParagraphable, isTxtColorable, isBgColorable } = e;

  e.isBgColorable = (n) => {
    if (CalloutElement.is(n)) return true;
    if (isBgColorable) return isBgColorable(n);
    return false;
  };
  e.isTxtColorable = (n) => {
    if (CalloutElement.is(n)) return true;
    if (isTxtColorable) return isTxtColorable(n);
    return false;
  };

  e.isParagraphable = (n) => {
    if (CalloutElement.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  return e;
};
