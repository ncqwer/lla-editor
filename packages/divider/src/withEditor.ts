import { Editor } from 'slate';

import { DividerElement } from './element';

export const withEditor = (e: Editor): Editor => {
  const { isVoid } = e;

  e.isVoid = (n) => {
    if (DividerElement.is(n)) return true;
    if (isVoid) return isVoid(n);
    return false;
  };

  return e;
};
