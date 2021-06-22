import { Editor } from 'slate';

import { CalloutElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isParagraphable } = e;

  e.isParagraphable = (n) => {
    if (CalloutElement.is(n)) return true;
    if (isParagraphable) return isParagraphable(n);
    return false;
  };

  return e;
};
